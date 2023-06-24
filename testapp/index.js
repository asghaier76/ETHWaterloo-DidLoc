const paillierBigint = require('paillier-bigint')

async function paillierTest () {
  // (asynchronous) creation of a random private, public key pair for the Paillier cryptosystem
  const { publicKey, privateKey } = await paillierBigint.generateRandomKeys(1024)

  // Optionally, you can create your public/private keys from known parameters
  const n = 161942003092727024729940643423892518719734535475906214886415006453054027938509788881836820057219155705764868406946789063388792703886592953702361677095663329274148205007962426131927943275586699046057318903735723017809023333627009453733400271369020199023962661807917079834869851507619394275378575039106923517147n;
  const g = 23688197298216943516510038320994209492722280219639890470188123289407199254316846950778734769648565262510361992118721665148624845900870781188625361907387058599024343540017801958801852787768931611732763822093651831233880488561902303988683946658662455017264695319105904179739446223059332026677656891024863865211020741904557940430671344629045394119253214654660872907574113990073382027283515571739684871247554886786639471982534050354287271830138416012354978231295179336971527290091010015528914151811564252805090530679113237660570158797067530495336529073377141119442208411712190734916268573919110856442805760428514191686979n;
  const publicKey2 = new paillierBigint.PublicKey(n, g)

  // First entity POI/Location
  const x = 14n
  const y = 0n

  // Second entity POI/Location
  const u = 10n
  const v = 0n

  // encryption of coordinates of first entity
  const xyFactor = publicKey.encrypt(x**2n+y**2n);
  const xFactor = publicKey.encrypt(-2n*x);
  const yFactor = publicKey.encrypt(-2n*y);
  console.log(xyFactor) 
  console.log(xFactor) 
  console.log(yFactor)
  
// encryption of coordinates of second entity
  const uvFactor = publicKey.encrypt(u**2n+v**2n);
  const xyuvFactor = publicKey.addition(xFactor**u, yFactor**v);
  console.log(uvFactor) 
  console.log(xyuvFactor) 

  const encDistance = publicKey.addition(xyFactor , uvFactor , xyuvFactor);
  console.log(encDistance)
  console.log(privateKey.decrypt(encDistance)) 

}
paillierTest()