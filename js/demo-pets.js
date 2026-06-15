(function () {
  // Deterministic LCG so the same 3246 pets are always generated
  let _s = 0xdeadbeef;
  function rng() { _s = (Math.imul(_s, 1664525) + 1013904223) | 0; return (_s >>> 0) / 0x100000000; }
  function pick(a) { return a[Math.floor(rng() * a.length)]; }
  function ri(lo, hi) { return Math.floor(rng() * (hi - lo + 1)) + lo; }
  function chance(p) { return rng() < p; }

  const FIRST = ['Emma','Liam','Olivia','Noah','Ava','Sophia','James','Isabella','Oliver','Mia',
    'Benjamin','Charlotte','Elijah','Amelia','Lucas','Harper','Mason','Evelyn','Logan','Aiden',
    'Sofia','Jackson','Ella','Sebastian','Scarlett','Ethan','Victoria','Michael','Luna','Owen',
    'Grace','Samuel','Chloe','Ryan','Penelope','Nathan','Riley','Julian','Zoey','Caleb',
    'Nora','Isaiah','Lily','Ezra','Eleanor','Wyatt','Hannah','Andrew','Lillian','Lincoln',
    'Addison','Daniel','Aubrey','Gabriel','Ellie','Henry','Stella','Carter','Natalie','Dylan',
    'Zoe','Jayden','Leah','John','Hazel','Luke','Violet','Anthony','Aurora','Isaac','Savannah',
    'Dylan','Audrey','Grayson','Brooklyn','Levi','Bella','Joshua','Claire','Christopher','Skylar',
    'Angel','Lucy','Andrew','Paisley','Josiah','Everly','Eli','Anna','Jaxon','Caroline',
    'Connor','Genesis','Cameron','Kennedy','Aaron','Samantha','Adrian','Hailey','Jeremiah','Alice',
    'Nolan','Sarah','Charles','Naomi','Dominic','Aaliyah','Jonathan','Elena','Mateo','Abigail',
    'Ezekiel','Maya','Thomas','Kylie','Robert','Ariana','Tyler','Nevaeh','Joshua','Layla'];

  const LAST = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson',
    'Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Young',
    'Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson',
    'Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans',
    'Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales',
    'Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed',
    'Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez',
    'Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo',
    'Sanders','Patel','Myers','Long','Ross','Foster','Jimenez','Powell','Jenkins','Perry',
    'Russell','Sullivan','Bell','Coleman','Butler','Henderson','Barnes','Gonzales','Fisher','Vasquez'];

  const DOG_BREEDS = ['Labrador Retriever','Golden Retriever','German Shepherd','Poodle','Beagle',
    'Bulldog','Husky','Chihuahua','Border Collie','Shih Tzu','Dachshund','Boxer','Rottweiler',
    'Yorkshire Terrier','Cocker Spaniel','Maltese','Doberman','Great Dane','Corgi','Schnauzer',
    'Australian Shepherd','Pomeranian','Bichon Frise','Cavalier King Charles','Basset Hound',
    'Bernese Mountain Dog','Samoyed','Dalmatian','Weimaraner','Vizsla','Mixed Breed'];

  const CAT_BREEDS = ['Domestic Shorthair','Siamese','Maine Coon','Persian','Bengal','Ragdoll',
    'British Shorthair','Tabby','Calico','Domestic Longhair','Sphynx','Scottish Fold',
    'Russian Blue','Burmese','Abyssinian','Norwegian Forest Cat','Turkish Angora','Mixed Breed'];

  const PET_NAMES = ['Max','Bella','Charlie','Luna','Cooper','Lucy','Buddy','Daisy','Rocky','Lola',
    'Jack','Sadie','Toby','Molly','Duke','Bailey','Bear','Maggie','Tucker','Sophie',
    'Oliver','Chloe','Milo','Stella','Bentley','Gracie','Zeus','Lily','Shadow','Zoe',
    'Buster','Coco','Sam','Roxy','Leo','Penny','Murphy','Ruby','Teddy','Ellie',
    'Gus','Rosie','Simba','Nala','Chester','Pepper','Scout','Ginger','Winston','Misty',
    'Harley','Annie','Jax','Sasha','Finn','Princess','Henry','Izzy','Thor','Peanut',
    'Rex','Angel','Jake','Lexi','Oscar','Marley','Zeus','Lulu','Rusty','Kona',
    'Bruno','Cleo','Atlas','Mochi','Oreo','Pumpkin','Moose','Hazel','Diesel','Willow',
    'Apollo','Maple','Ranger','Trixie','Hunter','Pixie','Beau','Cocoa','Dexter','Fiona',
    'Louie','Gigi','Archie','Cookie','Jasper','Daffy','Romeo','Mittens','Biscuit','Socks'];

  const COLORS = ['Black','White','Golden','Brown','Grey','Orange','Black and white','Brown and white',
    'Golden with white paws','Tabby (brown/black stripes)','Cream','Silver','Reddish brown',
    'Spotted black and white','Grey with white chest','Orange tabby','Dark grey','Chocolate brown',
    'White with brown patches','Tricolour (black/white/brown)','Blue-grey','Sandy blonde',
    'White with orange spots','Brindle','Merle grey','Apricot','Sable and white','Fawn',
    'Black with tan markings','White with black spots','Calico','Tortoiseshell','Dilute calico',
    'Tuxedo (black and white)','Smoky grey','Charcoal','Russet red','Pale cream'];

  const SPECIAL = ['Wears a red collar','Has a blue tag with name on it','Missing front left tooth',
    'Very friendly — will come to strangers','Microchipped','Wearing a pink harness',
    'Has a small scar on right ear','One eye slightly droopy','Fluffy tail, very distinctive',
    'Collar may have come off','Very shy, may hide','Neutered male','Spayed female',
    'Long bushy tail','Responds to its name quickly','Has a notched left ear',
    'Wears a green bandana','Limps slightly on back right leg','Extra fluffy around neck',
    'Distinctive yellow eyes','Very vocal, will meow/bark loudly','Last seen near the park',
    'No collar but microchipped','Wearing a purple collar with a heart tag',
    'Has white tipped paws','Darker stripe along its back','Very small for its breed',
    'Overweight, moves slowly','Elderly pet, moves carefully','Still a puppy / kitten',
    'Has a GPS tracker but battery may be dead','Will approach food immediately',
    'Afraid of loud noises','May be hiding under a porch or car','Unneutered male',
    'Bright blue eyes','Heterochromia — one blue one green eye','Very fluffy long coat',
    ''];

  const CITY_REGIONS = [
    {city:'New York, NY', country:'United States', lat:[40.65,40.85], lng:[-74.05,-73.85]},
    {city:'Los Angeles, CA', country:'United States', lat:[33.85,34.2], lng:[-118.55,-118.1]},
    {city:'Chicago, IL', country:'United States', lat:[41.7,42.05], lng:[-87.8,-87.55]},
    {city:'Houston, TX', country:'United States', lat:[29.65,29.9], lng:[-95.55,-95.2]},
    {city:'Phoenix, AZ', country:'United States', lat:[33.35,33.65], lng:[-112.2,-111.85]},
    {city:'Toronto, ON', country:'Canada', lat:[43.6,43.8], lng:[-79.55,-79.25]},
    {city:'Vancouver, BC', country:'Canada', lat:[49.2,49.35], lng:[-123.25,-122.95]},
    {city:'London', country:'United Kingdom', lat:[51.4,51.6], lng:[-0.25,0.05]},
    {city:'Manchester', country:'United Kingdom', lat:[53.4,53.55], lng:[-2.35,-2.1]},
    {city:'Sydney, NSW', country:'Australia', lat:[-34.05,-33.75], lng:[150.9,151.3]},
    {city:'Melbourne, VIC', country:'Australia', lat:[-37.95,-37.7], lng:[144.8,145.1]},
    {city:'Brisbane, QLD', country:'Australia', lat:[-27.6,-27.3], lng:[152.9,153.2]},
    {city:'Auckland', country:'New Zealand', lat:[-37.05,-36.75], lng:[174.6,174.9]},
    {city:'Dublin', country:'Ireland', lat:[53.25,53.45], lng:[-6.4,-6.15]},
    {city:'Berlin', country:'Germany', lat:[52.4,52.65], lng:[13.25,13.6]},
    {city:'Munich', country:'Germany', lat:[48.05,48.25], lng:[11.45,11.7]},
    {city:'Paris', country:'France', lat:[48.8,48.95], lng:[2.2,2.5]},
    {city:'Amsterdam', country:'Netherlands', lat:[52.3,52.45], lng:[4.8,5.0]},
    {city:'Madrid', country:'Spain', lat:[40.35,40.55], lng:[-3.75,-3.55]},
    {city:'Barcelona', country:'Spain', lat:[41.3,41.5], lng:[2.05,2.25]},
    {city:'Rome', country:'Italy', lat:[41.8,42.0], lng:[12.4,12.6]},
    {city:'Lisbon', country:'Portugal', lat:[38.65,38.8], lng:[-9.25,-9.05]},
    {city:'Vienna', country:'Austria', lat:[48.1,48.3], lng:[16.2,16.5]},
    {city:'Brussels', country:'Belgium', lat:[50.8,50.95], lng:[4.3,4.45]},
    {city:'Toronto, ON', country:'Canada', lat:[43.6,43.8], lng:[-79.55,-79.25]},
    {city:'Calgary, AB', country:'Canada', lat:[50.95,51.15], lng:[-114.2,-113.95]},
    {city:'Singapore', country:'Singapore', lat:[1.25,1.45], lng:[103.65,103.9]},
    {city:'Mumbai', country:'India', lat:[18.9,19.2], lng:[72.75,73.0]},
    {city:'Delhi', country:'India', lat:[28.55,28.75], lng:[77.1,77.35]},
    {city:'Cape Town', country:'South Africa', lat:[-34.05,-33.8], lng:[18.35,18.6]},
    {city:'Johannesburg', country:'South Africa', lat:[-26.3,-26.1], lng:[27.9,28.1]},
    {city:'Lagos', country:'Nigeria', lat:[6.4,6.65], lng:[3.25,3.5]},
    {city:'Nairobi', country:'Kenya', lat:[-1.4,-1.2], lng:[36.7,36.95]},
    {city:'Cairo', country:'Egypt', lat:[30.0,30.2], lng:[31.15,31.4]},
    {city:'Tokyo', country:'Japan', lat:[35.6,35.8], lng:[139.55,139.85]},
    {city:'Seoul', country:'South Korea', lat:[37.45,37.65], lng:[126.9,127.1]},
    {city:'Beijing', country:'China', lat:[39.8,40.0], lng:[116.25,116.5]},
    {city:'Shanghai', country:'China', lat:[31.1,31.35], lng:[121.35,121.6]},
    {city:'Jakarta', country:'Indonesia', lat:[-6.35,-6.1], lng:[106.7,106.95]},
    {city:'Manila', country:'Philippines', lat:[14.5,14.7], lng:[121.0,121.2]},
    {city:'Bangkok', country:'Thailand', lat:[13.65,13.85], lng:[100.4,100.65]},
    {city:'São Paulo', country:'Brazil', lat:[-23.65,-23.45], lng:[-46.75,-46.55]},
    {city:'Rio de Janeiro', country:'Brazil', lat:[-23.0,-22.8], lng:[-43.35,-43.15]},
    {city:'Buenos Aires', country:'Argentina', lat:[-34.7,-34.55], lng:[-58.5,-58.35]},
    {city:'Santiago', country:'Chile', lat:[-33.55,-33.35], lng:[-70.75,-70.55]},
    {city:'Mexico City', country:'Mexico', lat:[19.3,19.55], lng:[-99.25,-99.05]},
    {city:'Ottawa, ON', country:'Canada', lat:[45.35,45.5], lng:[-75.85,-75.6]},
    {city:'Edinburgh', country:'United Kingdom', lat:[55.9,56.0], lng:[-3.3,-3.15]},
    {city:'Auckland', country:'New Zealand', lat:[-37.05,-36.75], lng:[174.6,174.9]},
    {city:'Perth, WA', country:'Australia', lat:[-32.05,-31.8], lng:[115.75,116.0]},
  ];

  const STREETS = ['Maple St','Oak Ave','Cedar Rd','Pine St','Elm St','River Rd','Park Ave',
    'Hill Dr','Lake Rd','Forest Lane','Main St','Church St','School Rd','Garden Ave',
    'Valley Rd','Sunset Blvd','High St','Broadway','Station Rd','Beach Rd','Bay St',
    'Creek Rd','Mountain View Dr','Willows Way','Birchwood Ln','Rosewood Ave','Meadow Lane'];

  const ANIMALS = ['Dog','Dog','Dog','Dog','Cat','Cat','Cat','Cat','Rabbit','Bird','Hamster','Other'];

  const now = Date.now();
  const TWO_YEARS = 730 * 86400000;

  const pets = [];
  for (let i = 0; i < 3246; i++) {
    const region = pick(CITY_REGIONS);
    const animal = pick(ANIMALS);
    const isLost = chance(0.62);
    const isReunited = !isLost ? false : chance(0.14);
    const daysAgo = ri(1, 700);
    const postDate = new Date(now - daysAgo * 86400000);
    const dateStr = postDate.toISOString().split('T')[0];
    const firstName = pick(FIRST);
    const lastName = pick(LAST);
    const hasPhone = chance(0.75);
    const hasEmail = !hasPhone || chance(0.6);

    let breed = '';
    if (animal === 'Dog') breed = pick(DOG_BREEDS);
    else if (animal === 'Cat') breed = pick(CAT_BREEDS);
    else if (animal === 'Rabbit') breed = pick(['Holland Lop','Mini Rex','Lionhead','Dutch','Flemish Giant','Mixed']);
    else if (animal === 'Bird') breed = pick(['Budgie','Cockatiel','Parrot','Canary','Lovebird','Finch']);

    const lat = region.lat[0] + rng() * (region.lat[1] - region.lat[0]);
    const lng = region.lng[0] + rng() * (region.lng[1] - region.lng[0]);

    pets.push({
      id: 'demo-' + (i + 1),
      type: isLost ? 'lost' : 'found',
      owner_name: firstName + ' ' + lastName,
      phone: hasPhone ? ('0' + ri(400,499) + '-' + ri(100,999) + '-' + ri(1000,9999)) : '',
      email: hasEmail ? (firstName.toLowerCase() + '.' + ri(10,999) + '@' + pick(['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com'])) : '',
      phone_hidden: chance(0.15),
      pet_name: isLost ? pick(PET_NAMES) : (chance(0.3) ? pick(PET_NAMES) : 'Unknown'),
      animal,
      breed,
      color: pick(COLORS),
      size: pick(['Small','Small','Medium','Medium','Medium','Large','Large']),
      age: pick(['6 months','1 year','2 years','3 years','4 years','5 years','6 years','7 years','8 years','10 years','Senior (10+)','Young puppy','Kitten','Adult','']),
      location: ri(1,999) + ' ' + pick(STREETS),
      state: '',
      country: region.country,
      date: dateStr,
      special: pick(SPECIAL),
      reward: isLost && chance(0.28),
      lat: parseFloat(lat.toFixed(5)),
      lng: parseFloat(lng.toFixed(5)),
      reunited: isReunited,
      status: isReunited ? 'reunited' : 'active',
      photo_url: null,
      photo_url_2: null,
      photo_url_3: null,
      created_at: postDate.toISOString(),
      _fullLocation: ri(1,999) + ' ' + pick(STREETS) + ', ' + region.city + ', ' + region.country,
    });
  }

  // 10 hand-crafted reunited stories
  const REUNITED = [
    { id:'demo-r1', type:'lost', owner_name:'Sarah Mitchell', phone:'0412-334-982', email:'sarah.mitchell@gmail.com', phone_hidden:false, pet_name:'Biscuit', animal:'Dog', breed:'Beagle', color:'Tricolour (black/white/brown)', size:'Small', age:'4 years', location:'17 Maple St, Toronto, ON, Canada', date:'2026-05-02', special:'Wears a red collar with a bone tag', reward:true, lat:43.702, lng:-79.381, reunited:true, status:'reunited', photo_url:null, photo_url_2:null, photo_url_3:null, created_at:'2026-05-02T09:14:00Z' },
    { id:'demo-r2', type:'lost', owner_name:'James Okonkwo', phone:'0791-556-2210', email:'james.o.77@outlook.com', phone_hidden:false, pet_name:'Luna', animal:'Cat', breed:'Domestic Shorthair', color:'Grey with white chest', size:'Small', age:'2 years', location:'88 Church St, London, United Kingdom', date:'2026-04-18', special:'Very shy, may hide under cars', reward:false, lat:51.512, lng:-0.118, reunited:true, status:'reunited', photo_url:null, photo_url_2:null, photo_url_3:null, created_at:'2026-04-18T14:22:00Z' },
    { id:'demo-r3', type:'lost', owner_name:'Emily Nakamura', phone:'', email:'emily.naka@icloud.com', phone_hidden:false, pet_name:'Mochi', animal:'Rabbit', breed:'Holland Lop', color:'White with brown patches', size:'Small', age:'1 year', location:'304 Sunset Blvd, Los Angeles, CA, United States', date:'2026-03-29', special:'Has a tiny blue ear tag', reward:true, lat:34.072, lng:-118.384, reunited:true, status:'reunited', photo_url:null, photo_url_2:null, photo_url_3:null, created_at:'2026-03-29T11:05:00Z' },
    { id:'demo-r4', type:'lost', owner_name:'Carlos Mendez', phone:'0455-771-3302', email:'', phone_hidden:false, pet_name:'Rex', animal:'Dog', breed:'German Shepherd', color:'Black with tan markings', size:'Large', age:'6 years', location:'12 Park Ave, Sydney, NSW, Australia', date:'2026-05-10', special:'Responds immediately to his name', reward:true, lat:-33.871, lng:151.207, reunited:true, status:'reunited', photo_url:null, photo_url_2:null, photo_url_3:null, created_at:'2026-05-10T07:48:00Z' },
    { id:'demo-r5', type:'lost', owner_name:'Priya Sharma', phone:'0488-902-1145', email:'priya.sharma44@yahoo.com', phone_hidden:false, pet_name:'Coco', animal:'Cat', breed:'Bengal', color:'Spotted black and white', size:'Medium', age:'3 years', location:'56 Garden Ave, Melbourne, VIC, Australia', date:'2026-02-14', special:'Distinctive spotted coat, very friendly', reward:false, lat:-37.812, lng:144.963, reunited:true, status:'reunited', photo_url:null, photo_url_2:null, photo_url_3:null, created_at:'2026-02-14T16:30:00Z' },
    { id:'demo-r6', type:'lost', owner_name:'Liam O\'Brien', phone:'087-234-5671', email:'liam.obrien@gmail.com', phone_hidden:false, pet_name:'Finn', animal:'Dog', breed:'Golden Retriever', color:'Golden', size:'Large', age:'5 years', location:'9 River Rd, Dublin, Ireland', date:'2026-04-01', special:'Wears a pink harness, very friendly to strangers', reward:true, lat:53.338, lng:-6.267, reunited:true, status:'reunited', photo_url:null, photo_url_2:null, photo_url_3:null, created_at:'2026-04-01T10:12:00Z' },
    { id:'demo-r7', type:'lost', owner_name:'Aisha Thompson', phone:'0798-443-1209', email:'aisha.t@hotmail.com', phone_hidden:false, pet_name:'Nala', animal:'Cat', breed:'Siamese', color:'Cream with dark ears and paws', size:'Small', age:'7 years', location:'221 High St, Manchester, United Kingdom', date:'2026-01-20', special:'Blue eyes, very vocal', reward:false, lat:53.482, lng:-2.236, reunited:true, status:'reunited', photo_url:null, photo_url_2:null, photo_url_3:null, created_at:'2026-01-20T08:55:00Z' },
    { id:'demo-r8', type:'lost', owner_name:'Noah Fischer', phone:'', email:'noah.fischer@gmail.com', phone_hidden:false, pet_name:'Bruno', animal:'Dog', breed:'Rottweiler', color:'Black with tan markings', size:'Large', age:'3 years', location:'47 Oak Ave, Berlin, Germany', date:'2026-03-07', special:'Microchipped, very gentle despite appearance', reward:true, lat:52.521, lng:13.402, reunited:true, status:'reunited', photo_url:null, photo_url_2:null, photo_url_3:null, created_at:'2026-03-07T13:40:00Z' },
    { id:'demo-r9', type:'lost', owner_name:'Sofia Rossi', phone:'0632-881-4407', email:'sofia.rossi@outlook.com', phone_hidden:false, pet_name:'Stella', animal:'Cat', breed:'Persian', color:'White', size:'Medium', age:'5 years', location:'73 Meadow Lane, Rome, Italy', date:'2026-05-22', special:'Long fluffy coat, wears a gold collar', reward:false, lat:41.897, lng:12.482, reunited:true, status:'reunited', photo_url:null, photo_url_2:null, photo_url_3:null, created_at:'2026-05-22T15:20:00Z' },
  ];

  // Expose so getPets() can merge it in
  window.DEMO_PETS = [...pets, ...REUNITED];
})();
