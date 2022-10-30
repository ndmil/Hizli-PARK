const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const client = new Client({authStrategy: new LocalAuth(), puppeteer: { args: ["--no-sandbox"]}});


// Windows üzerinde çalışacaksanız, üstteki clienti yorum satırı hâline getirdikten sonra alttaki bölümü aktif hâle getirin
//const client = new Client({
//    authStrategy: new LocalAuth(),
//  });


// LocalAuth, QR kod okutma tekrarını engellemek için kullanılmaktadır. 1 kez QR kodunu okutmanız yeterli olacaktır.
const qrcode = require('qrcode-terminal');



client.on('qr', (qr) => {

    console.log('QR RECEIVED');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
  });

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (msg) => {
    
    await sleepRandom();

    if(msg.body === 'Merhaba, Bilgi alabilir miyim?'){
		client.sendMessage(msg.from, '🅿 Hizli PARK uygulamasini tercih ettiginiz icin tesekkur ederiz.\n Bulundugunuz konumu gönderdiginizde size en yakın 3 otoparki listeleyecegiz');
	}

       if(msg.location) {
       
        const chat = await msg.getChat();

        await chat.sendStateTyping();
      
        await sleepRandom();
 
        
        let LATITUDE = msg.location.latitude.toString();
  
        let LONGITUDE = msg.location.longitude.toString();
      

      
            let urlGoogle = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+LATITUDE+','+LONGITUDE+'&radius=3000&types=parking&key='+YOUR_KEY+''
            
            getLocation(urlGoogle).then(data => {
                try {

                    if(typeof data === 'string' || data.length === 0) {
                        client.sendMessage(msg.from, 'Etrafinizda yakin bir otopark bulunamadi')
                      }else {
      
                          for (let index = 0; index < data.length; index++) {
      
                              const name = data[index].name;
                              const lat = data[index].lat;
                              const lng = data[index].lng;
                   
                              let location = '*📍Lokasyon | '+name+'* \n https://maps.google.com/maps?q='+lat+','+lng+'&z=17&hl=en'
    
                              
                              client.sendMessage(msg.from, location)
    
                          }
      
                      }
                    
                } catch (error) {
                    client.sendMessage(msg.from, 'Etrafinizda yakin bir otopark bulunamadi veya sistemsel bir hata olustu')
                }
             
            
            })
        
       }
 
    
        
        

    
});

function getLocation(getUrl){
    
  const promise =  axios.get(getUrl)
  .then(res => {
    const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
    console.log('Status Code:', res.status);
    console.log('Date in Response header:', headerDate);

    const parkings = res.data;
 
    var arr = []
    if(parkings.results.length >= 3){
        for (let index = 0; index < parkings.results.length; index++) {

            if(index === 3)  
                break;
            let parkName = parkings.results[index].name;
            let lat = parkings.results[index].geometry.location.lat;
            let lng = parkings.results[index].geometry.location.lng;
            arr.push({name: parkName, lat:lat, lng:lng, sira:index})

        }
        return arr;
    }else if(parkings.results.length < 3){
        for (let index = 0; index < parkings.results.length; index++) {

            if(index === 2)  
                break;
            let parkName = parkings.results[index].name;
            let lat = parkings.results[index].geometry.location.lat;
            let lng = parkings.results[index].geometry.location.lng;
            arr.push({name: parkName, lat:lat, lng:lng, sira:index})

        }
        return arr;
    }else{
        return arr;
    }
 
  })
  .catch(err => {
    console.log('Error: ', err.message);
  });
  return promise;
}

async function sleepRandom() {
    const min = 1000;
    const max  = 4000;
    const ms = Math.floor(Math.random()*(min-max)) + max;
    await new Promise((resolve) => setTimeout(resolve,ms))
}

client.initialize();