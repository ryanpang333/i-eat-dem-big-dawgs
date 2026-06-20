(function () {
  // Deterministic LCG so the same 3246 pets are always generated
  let _s = 0xdeadbeef;
  function rng() { _s = (Math.imul(_s, 1664525) + 1013904223) | 0; return (_s >>> 0) / 0x100000000; }
  function pick(a) { return a[Math.floor(rng() * a.length)]; }
  function ri(lo, hi) { return Math.floor(rng() * (hi - lo + 1)) + lo; }
  function chance(p) { return rng() < p; }

  // ── Shared language name banks (reused by every country that speaks them) ──
  const _EN = { f:['Emma','Liam','Olivia','Noah','Ava','James','Sophia','Oliver','Mia','Lucas','Charlotte','Henry','Amelia','Jack','Grace','Leo','Ella','Mason','Lily','Ethan'], l:['Smith','Johnson','Williams','Brown','Jones','Miller','Davis','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Walker','Clark','Lewis'] };
  const _ES = { f:['Sofía','Mateo','Valentina','Santiago','Isabella','Sebastián','Camila','Nicolás','Valeria','Diego','Mariana','Daniel','Gabriela','Alejandro','Lucía','Andrés','Daniela','Carlos','Antonella','Javier'], l:['García','Martínez','Rodríguez','López','González','Pérez','Sánchez','Ramírez','Torres','Flores','Rivera','Gómez','Díaz','Cruz','Morales','Reyes','Gutiérrez','Ortiz','Castro','Vargas'] };
  const _PT = { f:['João','Maria','Pedro','Ana','Tiago','Beatriz','Miguel','Sofia','Rafael','Carolina','Bruno','Mariana','André','Inês','Diogo','Catarina','Gonçalo','Leonor','Rui','Matilde'], l:['Silva','Santos','Ferreira','Pereira','Oliveira','Costa','Rodrigues','Martins','Sousa','Fernandes','Gomes','Lopes','Marques','Almeida','Ribeiro','Carvalho','Teixeira','Moreira','Correia','Mendes'] };
  const _FR = { f:['Lucas','Emma','Hugo','Léa','Louis','Chloé','Nathan','Manon','Théo','Camille','Antoine','Sarah','Maxime','Inès','Romain','Julie','Alexandre','Laura','Adrien','Pauline'], l:['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau','Simon','Laurent','Lefebvre','Michel','David','Bertrand','Roux','Vincent','Fournier','Girard'] };
  const _DE = { f:['Lukas','Lena','Leon','Anna','Felix','Emma','Paul','Mia','Jonas','Hannah','Ben','Lea','Elias','Laura','Tim','Sophie','Finn','Marie','Noah','Julia'], l:['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann','Schäfer','Koch','Bauer','Richter','Klein','Wolf','Schröder','Neumann','Schwarz','Zimmermann'] };
  const _IT = { f:['Francesco','Sofia','Leonardo','Giulia','Alessandro','Aurora','Lorenzo','Alice','Mattia','Emma','Andrea','Giorgia','Gabriele','Martina','Riccardo','Chiara','Tommaso','Sara','Marco','Beatrice'], l:['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo','Conti','De Luca','Costa','Giordano','Rizzo','Lombardi','Moretti','Barbieri'] };
  const _AR = { f:['Mohammed','Fatima','Ahmed','Aisha','Ali','Mariam','Omar','Layla','Youssef','Nour','Khalid','Sara','Ibrahim','Huda','Hassan','Zainab','Tariq','Amira','Yusuf','Salma'], l:['Al-Sayed','Hassan','Ahmed','Ali','Ibrahim','Mahmoud','Khalil','Saleh','Abdullah','Al-Farsi','Haddad','Nasser','Karim','Rashid','Aziz','Mansour','Najjar','Salah','Younis','Hamdan'] };
  const _FA = { f:['Ali','Fatemeh','Mohammad','Zahra','Hossein','Maryam','Reza','Sara','Amir','Narges','Hamid','Leila','Mehdi','Fariba','Saeed','Shirin','Navid','Mahsa','Arash','Yasmin'], l:['Hosseini','Mohammadi','Ahmadi','Rezaei','Karimi','Moradi','Jafari','Bagheri','Sadeghi','Rahimi','Akbari','Hashemi','Ebrahimi','Nazari','Kazemi','Rostami','Mousavi','Salehi','Yousefi','Ghasemi'] };
  const _TR = { f:['Yusuf','Elif','Mustafa','Zeynep','Mehmet','Eda','Emir','Ayşe','Aylin','Ahmet','Merve','Burak','Selin','Ali','Büşra','Can','Defne','Murat','Fatma','Deniz'], l:['Yılmaz','Kaya','Demir','Şahin','Çelik','Yıldız','Yıldırım','Öztürk','Aydın','Özdemir','Arslan','Doğan','Kılıç','Aslan','Çetin','Korkmaz','Koç','Kurt','Şimşek','Polat'] };
  const _RU = { f:['Alexander','Anastasia','Dmitri','Maria','Ivan','Ekaterina','Sergei','Olga','Andrei','Natalia','Mikhail','Anna','Nikolai','Tatiana','Vladimir','Elena','Pavel','Svetlana','Alexei','Irina'], l:['Ivanov','Smirnov','Kuznetsov','Popov','Vasiliev','Petrov','Sokolov','Mikhailov','Novikov','Fedorov','Morozov','Volkov','Alekseev','Lebedev','Semenov','Egorov','Pavlov','Kozlov','Stepanov','Nikolaev'] };
  const _UA = { f:['Andriy','Sofia','Dmytro','Anastasia','Oleksandr','Mariya','Ivan','Kateryna','Volodymyr','Olha','Serhiy','Tetiana','Mykola','Yuliya','Vasyl','Iryna','Petro','Nataliya','Taras','Oksana'], l:['Melnyk','Shevchenko','Boyko','Kovalenko','Bondarenko','Tkachenko','Kovalchuk','Kravchenko','Oliynyk','Shevchuk','Polishchuk','Bondar','Tkachuk','Marchenko','Lysenko','Rudenko','Moroz','Savchenko','Kravets','Pavlenko'] };
  const _PL = { f:['Jakub','Zuzanna','Jan','Julia','Szymon','Maja','Filip','Zofia','Kacper','Lena','Antoni','Hanna','Michał','Aleksandra','Wojciech','Natalia','Mateusz','Wiktoria','Piotr','Oliwia'], l:['Nowak','Kowalski','Wiśniewski','Wójcik','Kowalczyk','Kamiński','Lewandowski','Zieliński','Szymański','Woźniak','Dąbrowski','Kozłowski','Jankowski','Mazur','Wojciechowski','Kwiatkowski','Krawczyk','Kaczmarek','Piotrowski','Grabowski'] };
  const _CZ = { f:['Jakub','Eliška','Jan','Tereza','Tomáš','Anna','Adam','Natálie','Matěj','Karolína','Vojtěch','Kristýna','Filip','Barbora','Ondřej','Adéla','David','Veronika','Lukáš','Klára'], l:['Novák','Svoboda','Novotný','Dvořák','Černý','Procházka','Kučera','Veselý','Horák','Němec','Pokorný','Marek','Pospíšil','Hájek','Jelínek','Král','Růžička','Beneš','Fiala','Sedláček'] };
  const _HU = { f:['Bence','Hanna','Máté','Anna','Levente','Jázmin','Dávid','Zsófia','Ádám','Lili','Dominik','Réka','Gergő','Boglárka','Marcell','Eszter','Balázs','Petra','Dániel','Luca'], l:['Nagy','Kovács','Tóth','Szabó','Horváth','Varga','Kiss','Molnár','Németh','Farkas','Balogh','Papp','Takács','Juhász','Lakatos','Mészáros','Oláh','Simon','Rácz','Fekete'] };
  const _RO = { f:['Andrei','Maria','Alexandru','Elena','Mihai','Ioana','Gabriel','Ana','Ștefan','Andreea','Cristian','Gabriela','Florin','Cristina','Ionuț','Daniela','Vlad','Alexandra','George','Bianca'], l:['Popescu','Ionescu','Popa','Pop','Radu','Dumitru','Stan','Stoica','Gheorghe','Matei','Constantin','Marin','Tudor','Barbu','Nistor','Florea','Munteanu','Diaconu','Lungu','Moldovan'] };
  const _BG = { f:['Georgi','Maria','Ivan','Elena','Dimitar','Viktoria','Aleksandar','Gabriela','Nikolay','Ivana','Stefan','Petya','Martin','Desislava','Hristo','Yana','Todor','Tsvetelina','Kaloyan','Radost'], l:['Ivanov','Georgiev','Dimitrov','Petrov','Nikolov','Todorov','Hristov','Stoyanov','Marinov','Angelov','Kolev','Vasilev','Iliev','Yordanov','Petkov','Atanasov','Stefanov','Kostov','Pavlov','Borisov'] };
  const _SS = { f:['Luka','Marija','Marko','Ana','Nikola','Ivana','Stefan','Milica','Petar','Jelena','Nemanja','Sara','Aleksandar','Katarina','Filip','Tijana','Miloš','Jovana','Vuk','Teodora'], l:['Jovanović','Petrović','Nikolić','Marković','Đorđević','Stojanović','Ilić','Stanković','Pavlović','Milošević','Popović','Kovačević','Babić','Knežević','Horvat','Kovač','Marić','Tomić','Lukić','Radić'] };
  const _GR = { f:['Georgios','Maria','Ioannis','Eleni','Dimitrios','Katerina','Konstantinos','Sofia','Nikolaos','Vasiliki','Panagiotis','Despina','Christos','Anna','Athanasios','Dimitra','Andreas','Georgia','Spyros','Ioanna'], l:['Papadopoulos','Vlachos','Angelopoulos','Nikolaidis','Georgiou','Dimitriou','Pappas','Karagiannis','Makris','Oikonomou','Papandreou','Vasilakis','Konstantinidis','Antoniou','Christodoulou','Stavrou','Petrou','Theodorou','Samaras','Florakis'] };
  const _SC = { f:['William','Emma','Oscar','Alice','Lucas','Maja','Liam','Ella','Oliver','Olivia','Hugo','Astrid','Noah','Wilma','Elias','Ebba','Filip','Saga','Axel','Freja'], l:['Andersson','Johansson','Karlsson','Nilsson','Eriksson','Larsson','Olsson','Hansen','Jensen','Nielsen','Pedersen','Larsen','Olsen','Berg','Hagen','Johansen','Lindgren','Bergström','Lindqvist','Dahl'] };
  const _FI = { f:['Eino','Aino','Väinö','Emma','Onni','Sofia','Leo','Aada','Elias','Helmi','Niilo','Ella','Eeli','Venla','Oliver','Iida','Aapo','Lilja','Joel','Sara'], l:['Korhonen','Virtanen','Mäkinen','Nieminen','Mäkelä','Hämäläinen','Laine','Heikkinen','Koskinen','Järvinen','Lehtonen','Lehtinen','Saarinen','Salminen','Heinonen','Niemi','Heikkilä','Kinnunen','Salonen','Turunen'] };
  const _IS = { f:['Jón','Guðrún','Sigurður','Anna','Gunnar','Kristín','Einar','Margrét','Ólafur','Sigríður','Magnús','Helga','Kristján','Katrín','Stefán','Elín','Árni','Ásta','Bjarni','Hanna'], l:['Jónsson','Sigurðsson','Guðmundsson','Einarsson','Gunnarsson','Ólafsson','Magnússon','Jónsdóttir','Sigurðardóttir','Guðmundsdóttir','Stefánsdóttir','Kristjánsdóttir','Helgason','Pálsson','Björnsson','Halldórsson','Árnason','Jóhannsson','Karlsson','Þórsdóttir'] };
  const _EE = { f:['Rasmus','Sofia','Robin','Mia','Markus','Maria','Martin','Lisandra','Sander','Eliise','Oliver','Laura','Henri','Emma','Karl','Anna','Romet','Nora','Joosep','Iti'], l:['Tamm','Saar','Sepp','Mägi','Kask','Kukk','Rebane','Ilves','Pärn','Koppel','Lepik','Kallas','Raudsepp','Õun','Kuusk','Laur','Aru','Vaher','Mets','Saare'] };
  const _LV = { f:['Roberts','Sofija','Markuss','Marta','Daniels','Anna','Gustavs','Emīlija','Artūrs','Alise','Rihards','Estere','Toms','Beāte','Kārlis','Luīze','Niks','Elīza','Ralfs','Paula'], l:['Bērziņš','Kalniņš','Ozoliņš','Jansons','Ozols','Liepa','Krūmiņš','Balodis','Vītols','Eglītis','Zariņš','Pētersons','Kļaviņš','Vanags','Skujiņš','Lācis','Auziņš','Briedis','Riekstiņš','Sproģis'] };
  const _LT = { f:['Matas','Emilija','Nojus','Sofija','Kajus','Liepa','Dovydas','Urtė','Jokūbas','Gabija','Lukas','Austėja','Dominykas','Kamilė','Aronas','Saulė','Nedas','Goda','Tomas','Viltė'], l:['Kazlauskas','Jankauskas','Petrauskas','Stankevičius','Vasiliauskas','Žukauskas','Butkus','Paulauskas','Urbonas','Kavaliauskas','Pocius','Navickas','Rimkus','Kairys','Stonkus','Mickevičius','Balčiūnas','Adomaitis','Sakalauskas','Bagdonas'] };
  const _AL = { f:['Endrit','Sara','Klaudio','Erisa','Arber','Megi','Dorian','Klea','Geri','Ana','Klevis','Jona','Aldo','Fatjona','Erion','Xhesika','Florian','Greta','Besnik','Elona'], l:['Hoxha','Shehu','Krasniqi','Berisha','Gjoni','Dervishi','Hasani','Kelmendi','Prifti','Bregu','Cela','Doci','Frasheri','Gashi','Kola','Leka','Marku','Nika','Rama','Zeneli'] };
  const _HE = { f:['Noam','Maya','Itai','Tamar','Yosef','Noa','David','Shira','Eitan','Yael','Ariel','Adele','Daniel','Talia','Lior','Avigail','Omer','Hila','Yonatan','Roni'], l:['Cohen','Levi','Mizrahi','Peretz','Biton','Dahan','Avraham','Friedman','Katz','Azoulay','Malka','Gabay','Shapira','Ben-David','Barak','Segal','Adler','Klein','Golan','Aviv'] };
  const _UR = { f:['Muhammad','Ayesha','Ali','Fatima','Hassan','Zainab','Bilal','Maryam','Usman','Hina','Ahmed','Sana','Hamza','Aliya','Faisal','Mehwish','Imran','Sadia','Asad','Rabia'], l:['Khan','Ahmed','Ali','Hussain','Malik','Sheikh','Butt','Chaudhry','Qureshi','Raza','Iqbal','Javed','Aslam','Farooq','Nawaz','Rashid','Saeed','Bhatti','Mahmood','Siddiqui'] };
  const _BN = { f:['Rahim','Ayesha','Karim','Fatima','Hasan','Nusrat','Rakib','Sumaiya','Tanvir','Mim','Sakib','Jannat','Imran','Tania','Shovon','Sadia','Arif','Mitu','Fahim','Rumana'], l:['Islam','Rahman','Ahmed','Hossain','Akter','Khan','Begum','Chowdhury','Sarkar','Das','Sheikh','Mia','Uddin','Khatun','Ali','Haque','Miah','Bhuiyan','Roy','Saha'] };
  const _LK = { f:['Nimal','Kumari','Sunil','Dilani','Ruwan','Sandya','Chaminda','Nilani','Kasun','Ishara','Lasith','Dinusha','Tharindu','Sachini','Pradeep','Madhavi','Nuwan','Hasini','Roshan','Amaya'], l:['Perera','Fernando','Silva','Bandara','Jayawardena','Wickramasinghe','Rajapaksa','Gunawardena','Dissanayake','Ratnayake','Senanayake','Mendis','Wijesinghe','Herath','Kumara','Pathirana','Weerasinghe','Samaraweera','Ekanayake','Karunaratne'] };
  const _NP = { f:['Aarav','Aasha','Bibek','Sita','Prakash','Anjali','Suman','Puja','Ramesh','Sunita','Bishal','Gita','Nabin','Manisha','Sandeep','Sarita','Dipesh','Rojina','Hari','Bina'], l:['Shrestha','Sharma','Adhikari','Thapa','Gurung','Magar','Tamang','Karki','Rai','Khadka','Bhattarai','Poudel','Koirala','Dahal','Acharya','Bhandari','Maharjan','Pandey','Subedi','Lama'] };
  const _VN = { f:['Anh','Linh','Minh','Huong','Tuan','Lan','Hung','Mai','Nam','Thu','Quan','Trang','Long','Hoa','Phong','Ngoc','Duc','Hanh','Khoa','Yen'], l:['Nguyen','Tran','Le','Pham','Hoang','Phan','Vu','Dang','Bui','Do','Ho','Ngo','Duong','Ly','Vo','Dinh','Truong','Mai','Cao','Luong'] };
  const _KH = { f:['Sokha','Srey','Dara','Bopha','Vibol','Channary','Rithy','Sophea','Pisey','Kosal','Chankrisna','Maly','Veasna','Theary','Samnang','Davy','Vichea','Sothea','Ratanak','Leakhena'], l:['Sok','Chan','Kim','Lim','Heng','Ouch','Pich','Chea','Sam','Meas','Hor','Ly','Ros','Khiev','Touch','Nuon','Em','Yim','Seng','Mao'] };
  const _LA = { f:['Somsak','Bounmy','Khamla','Vandara','Phout','Noy','Kham','Souk','Vilay','Mali','Thong','Daeng','Sengdao','Boua','Khamphone','Lamai','Aloun','Keo','Sai','Phila'], l:['Sisavath','Vongsa','Phommavong','Inthavong','Sayavong','Keomany','Chanthavong','Phimmasone','Rattanavong','Soulivong','Vilayvanh','Bounmany','Khamvongsa','Thammavong','Sengdara','Manivong','Khamphan','Oudomsouk','Saysana','Vongphachanh'] };
  const _MM = { f:['Aung','Su','Kyaw','Hla','Min','Thida','Zaw','Nwe','Htin','Khin','Soe','Mya','Naing','Aye','Win','Ei','Tun','Sandar','Myo','Yamin'], l:['Aung','Kyaw','Win','Htun','Oo','Hlaing','Soe','Maung','Myint','Zaw','Naing','Tun','Moe','Lwin','Thant','Kyi','Phyo','Nyein','Han','Wai'] };
  const _MS = { f:['Ahmad','Nur','Muhammad','Siti','Mohd','Aisyah','Faiz','Farah','Hafiz','Aina','Amir','Liyana','Iskandar','Sofia','Zul','Nadia','Haziq','Alya','Danish','Iman'], l:['bin Abdullah','binti Ahmad','Ismail','Hassan','Rahman','Yusof','Ibrahim','Othman','Bakar','Hamid','Razak','Salleh','Aziz','Omar','Karim','Mansor','Zainal','Daud','Rashid','Saad'] };
  const _ZH = { f:['Wei','Fang','Yang','Jing','Li','Xiao','Hua','Lei','Mei','Hong','Xin','Ping','Jun','Feng','Hui','Tao','Yan','Zhen','Hao','Ling'], l:['Wang','Li','Zhang','Liu','Chen','Yang','Huang','Zhao','Wu','Zhou','Xu','Sun','Ma','Zhu','Hu','Lin','Guo','He','Gao','Luo'] };
  const _MN = { f:['Bat','Sara','Temujin','Bolormaa','Ganbold','Oyun','Chuluun','Narantsetseg','Erdene','Tuya','Bayar','Saruul','Munkh','Enkhtuya','Otgon','Bolor','Ganzorig','Khulan','Tseren','Nomin'], l:['Batbayar','Ganbaatar','Dorj','Tsogt','Baatar','Enkhbat','Erdene','Chuluun','Munkh','Otgonbayar','Gantulga','Sukhbaatar','Battulga','Nergui','Tserendorj','Davaa','Lhagva','Bold','Jargal','Tumen'] };
  const _CA = { f:['Aibek','Aigerim','Nurlan','Dilnoza','Timur','Zarina','Ruslan','Madina','Bek','Gulnara','Azamat','Aliya','Daniyar','Kamila','Erlan','Nazgul','Bauyrzhan','Saule','Arman','Dinara'], l:['Nazarbayev','Aliyev','Karimov','Usmanov','Ibragimov','Yusupov','Akhmedov','Rashidov','Bekov','Sultanov','Mirzaev','Saidov','Toktosunov','Abdullaev','Ismailov','Kadyrov','Sharipov','Nazarov','Tashkenov','Yermekov'] };
  const _GE = { f:['Giorgi','Mariam','Davit','Tamar','Nika','Ana','Luka','Nino','Saba','Salome','Sandro','Elene','Irakli','Natia','Levan','Khatia','Zurab','Eka','Vakhtang','Lika'], l:['Beridze','Kapanadze','Gelashvili','Maisuradze','Giorgadze','Lomidze','Tsiklauri','Bregadze','Tabidze','Khurtsilava','Janashia','Kvaratskhelia','Gogoladze','Chkheidze','Dvali','Nadiradze','Tsereteli','Abramishvili','Tatishvili','Kobakhidze'] };
  const _AM = { f:['Aram','Ani','Davit','Mariam','Narek','Lilit','Tigran','Anahit','Hayk','Nare','Gor','Mané','Levon','Sona','Vahe','Gayane','Armen','Lusine','Ashot','Syuzanna'], l:['Hovhannisyan','Sargsyan','Harutyunyan','Grigoryan','Petrosyan','Khachatryan','Hakobyan','Vardanyan','Stepanyan','Karapetyan','Gevorgyan','Avetisyan','Manukyan','Davtyan','Mkrtchyan','Galstyan','Ghazaryan','Minasyan','Simonyan','Aslanyan'] };
  const _AZ = { f:['Ali','Fatima','Murad','Aysel','Tural','Nigar','Elvin','Leyla','Orkhan','Gunel','Rashad','Sevinj','Kamran','Aytaj','Nijat','Khayal','Farid','Lala','Ramin','Ulviyya'], l:['Aliyev','Mammadov','Hasanov','Huseynov','Guliyev','Ahmadov','Ismayilov','Rzayev','Abbasov','Jafarov','Karimov','Babayev','Quliyev','Suleymanov','Veliyev','Najafov','Tagiyev','Orujov','Aliyeva','Mammadova'] };
  const _SW = { f:['Juma','Amani','Baraka','Zuri','Jabari','Nia','Hamisi','Asha','Rashidi','Imani','Salim','Neema','Bakari','Pendo','Tumaini','Subira','Fadhili','Rehema','Daudi','Halima'], l:['Mwangi','Juma','Hassan','Said','Abdallah','Mohamed','Ali','Omari','Hamisi','Bakari','Mwinyi','Athumani','Salim','Rashid','Khamis','Shabani','Mussa','Iddi','Suleiman','Ramadhani'] };
  const _ET = { f:['Abebe','Tigist','Dawit','Hana','Yonas','Selam','Mulugeta','Bethlehem','Tesfaye','Meron','Getachew','Saba','Abel','Eden','Solomon','Helen','Bereket','Lily','Henok','Mahlet'], l:['Tadesse','Bekele','Girma','Haile','Mengistu','Abebe','Tesfaye','Assefa','Gebre','Wolde','Desta','Alemu','Kebede','Teshome','Mekonnen','Negussie','Hailu','Demeke','Fikru','Worku'] };
  const _GH = { f:['Kwame','Ama','Kofi','Akosua','Yaw','Abena','Kojo','Esi','Kwabena','Afia','Kwaku','Adwoa','Fiifi','Akua','Ato','Efua','Nana','Maa','Kobby','Araba'], l:['Mensah','Owusu','Boateng','Asante','Osei','Agyeman','Appiah','Acheampong','Adjei','Ofori','Annan','Darko','Frimpong','Gyamfi','Quaye','Bonsu','Nkrumah','Amoah','Antwi','Danso'] };

  const NAMES = {
    'United States': {
      f:['Emma','Liam','Olivia','Noah','Ava','Sophia','James','Isabella','Oliver','Mia','Benjamin','Charlotte','Elijah','Amelia','Lucas','Harper','Mason','Evelyn','Logan','Aiden','Michael','Emily','Daniel','Madison','Matthew','Chloe','Ryan','Abigail','Tyler','Grace'],
      l:['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Young','Allen','King','Wright','Scott','Hill','Green','Adams','Baker','Hall','Rivera','Campbell']
    },
    'Canada': {
      f:['Liam','Olivia','Noah','Emma','William','Ava','Lucas','Isabella','Ethan','Sophia','Mason','Charlotte','Logan','Amelia','James','Harper','Benjamin','Evelyn','Owen','Abigail','Nathan','Scarlett','Jack','Emily','Alexander','Lily','Carter','Hannah','Luke','Zoe'],
      l:['Smith','Brown','Martin','Roy','Côté','Tremblay','Gagnon','Wilson','Taylor','Anderson','Thomas','Lee','Johnson','White','Harris','Thompson','Young','Allen','King','Wright','Scott','Lavoie','Belanger','Leblanc','Bouchard','Morin','Fortin','Gauthier','Simard','Ouellet']
    },
    'United Kingdom': {
      f:['Oliver','Amelia','George','Isla','Harry','Olivia','Jack','Ava','Charlie','Emily','James','Jessica','Oscar','Sophia','William','Grace','Noah','Lily','Thomas','Evie','Alfie','Poppy','Archie','Isabella','Jacob','Sophie','Ethan','Mia','Joshua','Chloe'],
      l:['Smith','Jones','Williams','Taylor','Brown','Davies','Evans','Wilson','Thomas','Roberts','Johnson','Lewis','Walker','Robinson','Wood','Thompson','White','Watson','Jackson','Wright','Green','Harris','Cooper','King','Lee','Martin','Clarke','James','Morgan','Edwards']
    },
    'Ireland': {
      f:['Liam','Emma','Conor','Aoife','Sean','Niamh','Patrick','Ciara','Oisín','Sinéad','Ciarán','Caoimhe','Darragh','Siobhán','Fionn','Roisín','Cathal','Éabha','Tadhg','Áine','Seán','Méabh','Diarmuid','Orla','Cillian','Clodagh','Ruairí','Aoibheann','Pádraig','Fionnuala'],
      l:['Murphy','Kelly','O\'Brien','Walsh','Smith','O\'Sullivan','Ryan','Burke','O\'Connor','Byrne','O\'Neill','Doyle','McCarthy','Gallagher','O\'Doherty','Kennedy','Lynch','Murray','Quinn','Moore','McLaughlin','Carroll','Connolly','O\'Reilly','Daly','Collins','O\'Callaghan','Dunne','Farrell','Brennan']
    },
    'Australia': {
      f:['Oliver','Charlotte','William','Olivia','Jack','Ava','Noah','Mia','Leo','Amelia','Henry','Isla','Lucas','Grace','Thomas','Chloe','James','Sophie','Mason','Ella','Ethan','Emily','Liam','Zoe','Jackson','Isabella','Jacob','Hannah','Logan','Harper'],
      l:['Smith','Jones','Williams','Brown','Wilson','Taylor','Anderson','Thomas','White','Harris','Martin','Thompson','Young','Allen','King','Wright','Scott','Robinson','Walker','Wood','Hill','Green','Mitchell','Carter','Bennett','Turner','Parker','Evans','Phillips','Edwards']
    },
    'New Zealand': {
      f:['Oliver','Charlotte','Noah','Olivia','Jack','Isabella','William','Ava','James','Sophie','Lucas','Amelia','Thomas','Grace','Liam','Emily','Ethan','Lily','Benjamin','Ella','Hunter','Zoe','Logan','Aria','Mason','Hannah','Jacob','Chloe','Henry','Mia'],
      l:['Smith','Jones','Williams','Brown','Wilson','Taylor','Anderson','White','Johnson','Martin','Thompson','Young','Allen','King','Wright','Scott','Walker','Harris','Robinson','Davies','Moore','Edwards','Mitchell','Clarke','Evans','Hall','Turner','Carter','Baker','Cooper']
    },
    'Germany': {
      f:['Lukas','Lena','Leon','Anna','Maximilian','Emma','Paul','Mia','Felix','Hannah','Jonas','Leonie','Noah','Lea','Ben','Laura','Elias','Sarah','Tim','Julia','Finn','Katharina','Moritz','Sophie','Jan','Lisa','Niklas','Marie','Tobias','Nina'],
      l:['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann','Schäfer','Koch','Bauer','Richter','Klein','Wolf','Schröder','Neumann','Schwarz','Zimmermann','Braun','Krüger','Hofmann','Hartmann','Lange','Schmitt','Werner','Schmitz','Krause','Meier']
    },
    'Austria': {
      f:['Lukas','Anna','Maximilian','Marie','Florian','Sophie','Tobias','Julia','Michael','Laura','Stefan','Lena','Patrick','Eva','Thomas','Sarah','Christoph','Lisa','Markus','Hannah','Daniel','Katharina','David','Claudia','Johannes','Barbara','Andreas','Elisabeth','Simon','Monika'],
      l:['Huber','Gruber','Bauer','Wagner','Müller','Pichler','Steiner','Moser','Mayer','Hofer','Leitner','Berger','Brunner','Wimmer','Eder','Winkler','Weber','Schwarz','Reiter','Mayr','Koller','Egger','Fröhlich','Maier','Lehner','Stadler','Haas','Frank','Hackl','Schneider']
    },
    'France': {
      f:['Emma','Liam','Chloé','Lucas','Inès','Nathan','Léa','Hugo','Manon','Louis','Camille','Théo','Julie','Tom','Lucie','Noah','Jade','Maxime','Sarah','Antoine','Laura','Baptiste','Pauline','Romain','Alice','Quentin','Marie','Alexis','Charlotte','Florian'],
      l:['Martin','Bernard','Thomas','Petit','Robert','Richard','Durand','Dubois','Moreau','Laurent','Simon','Michel','Lefebvre','Leroy','Roux','David','Bertrand','Morel','Fournier','Girard','Bonnet','Dupont','Lambert','Fontaine','Rousseau','Vincent','Muller','Lefevre','Faure','André']
    },
    'Netherlands': {
      f:['Liam','Emma','Noah','Olivia','Lucas','Mia','Levi','Ava','Sem','Sara','Finn','Julia','Daan','Noor','Bram','Tess','Jesse','Anna','Lars','Fleur','Thijs','Sophie','Milan','Floor','Tom','Roos','Julian','Noa','Luuk','Femke'],
      l:['de Vries','van den Berg','van Dijk','Bakker','Janssen','Visser','Smit','Meijer','de Boer','Mulder','de Groot','Bos','Vos','Peters','Hendriks','van Leeuwen','Dijkstra','Brouwer','de Wit','van der Berg','Kuijpers','van der Linden','Kok','Jacobs','Vermeer','Graaf','Laan','Kuiper','Hermans','Willems']
    },
    'Belgium': {
      f:['Liam','Emma','Louis','Olivia','Noah','Lucie','Arthur','Jade','Nathan','Camille','Lucas','Inès','Tom','Chloé','Maxime','Laura','Julien','Sarah','Antoine','Alice','Romain','Julie','Thomas','Léa','Hugo','Marie','Baptiste','Manon','Simon','Charlotte'],
      l:['Peeters','Janssen','Maes','Jacobs','Mertens','Willems','Claes','Goossens','Wouters','Martens','Leclercq','Dubois','Simon','Laurent','Lecomte','Dupont','Renard','Fontaine','Bastin','Collignon','De Smedt','Vermeersch','Bogaert','Claeys','Desmet','Declercq','Nijs','Pieters','Raes','Aerts']
    },
    'Spain': {
      f:['Lucía','Hugo','Sofía','Mateo','María','Martín','Martina','Alejandro','Julia','Daniel','Paula','Pablo','Valentina','Álvaro','Emma','Diego','Claudia','Adrián','Alba','Carlos','Noa','Javier','Sara','David','Valeria','Sergio','Carla','Miguel','Inés','Marcos'],
      l:['García','Martínez','López','Sánchez','González','Pérez','Rodríguez','Fernández','Jiménez','Ruiz','Hernández','Díaz','Álvarez','Moreno','Muñoz','Romero','Alonso','Gutiérrez','Navarro','Torres','Domínguez','Vásquez','Ramos','Gil','Ramírez','Serrano','Blanco','Suárez','Molina','Morales']
    },
    'Italy': {
      f:['Francesco','Sofia','Leonardo','Giulia','Lorenzo','Martina','Alessandro','Aurora','Andrea','Alice','Matteo','Ginevra','Gabriele','Emma','Riccardo','Giorgia','Edoardo','Greta','Federico','Chiara','Luca','Beatrice','Tommaso','Federica','Mattia','Eleonora','Marco','Sara','Jacopo','Valentina'],
      l:['Rossi','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo','Conti','De Luca','Mancini','Costa','Giordano','Rizzo','Lombardi','Moretti','Barbieri','Fontana','Santoro','Marini','Rinaldi','Caruso','Ferretti','Ferrara','Gatti','Martini','Leone']
    },
    'Portugal': {
      f:['João','Maria','Rodrigo','Beatriz','Martim','Inês','Tomás','Francisca','Francisco','Ana','Afonso','Leonor','Diogo','Mariana','Santiago','Catarina','Guilherme','Sofia','Pedro','Carolina','Luís','Filipa','Miguel','Rita','António','Marta','Rafael','Sara','André','Mafalda'],
      l:['Silva','Santos','Ferreira','Pereira','Oliveira','Costa','Rodrigues','Martins','Sousa','Fernandes','Gonçalves','Gomes','Lopes','Marques','Carvalho','Almeida','Araújo','Melo','Neves','Pinto','Machado','Correia','Mendes','Teixeira','Monteiro','Fonseca','Moreira','Pires','Lima','Simões']
    },
    'Singapore': {
      f:['Wei','Jia','Ming','Li','Xin','Hui','Jun','Yan','Zhen','Mei','Ahmad','Siti','Nur','Rajan','Priya','Kavya','Darren','Rachel','Marcus','Stephanie','Daniel','Nicole','Brandon','Jasmine','Ethan','Chloe','Ryan','Vanessa','Joshua','Michelle'],
      l:['Tan','Lee','Ng','Lim','Wong','Chan','Koh','Ong','Teo','Chua','Ho','Goh','Yeo','Low','Sim','Soh','Tay','Yap','Quek','Seah','Phua','Nair','Krishnan','Rajah','Kumar','Devan','Ramesh','Hassan','Ibrahim','Rahman']
    },
    'India': {
      f:['Rahul','Priya','Arjun','Anjali','Rohan','Deepika','Vikram','Neha','Aditya','Pooja','Kiran','Kavya','Sanjay','Asha','Nikhil','Divya','Rajesh','Meera','Suresh','Sunita','Aarav','Diya','Vivaan','Ananya','Aakash','Shreya','Ishaan','Riya','Vihaan','Avni'],
      l:['Sharma','Patel','Singh','Kumar','Gupta','Joshi','Agarwal','Verma','Mehta','Shah','Chauhan','Pandey','Mishra','Yadav','Tiwari','Reddy','Nair','Iyer','Krishnan','Pillai','Chatterjee','Banerjee','Das','Bose','Sen','Rao','Kulkarni','Desai','Patil','Jain']
    },
    'Japan': {
      f:['Haruto','Yui','Sota','Hina','Yuto','Rin','Riku','Mio','Hayato','Akari','Kaito','Nana','Shota','Mei','Ren','Aoi','Sora','Sakura','Yuki','Hana','Taiga','Koharu','Hiroto','Yuna','Ryota','Hinata','Daichi','Nanami','Naoki','Misaki'],
      l:['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Ito','Yamamoto','Nakamura','Kobayashi','Kato','Yoshida','Yamada','Sasaki','Yamaguchi','Matsumoto','Inoue','Kimura','Hayashi','Shimizu','Yamazaki','Mori','Abe','Ikeda','Hashimoto','Yamashita','Ishikawa','Nakajima','Maeda','Fujita','Ogawa']
    },
    'South Korea': {
      f:['Minho','Jisoo','Seojun','Jimin','Hyunwoo','Minji','Junho','Yuna','Jaesung','Soyeon','Taehyung','Dahyun','Sehun','Chaeyoung','Donghyun','Nayeon','Yoongi','Seolhyun','Jiwon','Hyeri','Jiho','Eunji','Jaehyun','Irene','Jungkook','Wendy','Wooyoung','Seulgi','Yugyeom','Joy'],
      l:['Kim','Lee','Park','Choi','Jung','Kang','Cho','Yoon','Chang','Lim','Han','Oh','Seo','Shin','Kwon','Hwang','Ahn','Song','Hong','Moon','Jang','Bae','Im','Ryu','Nam','Baek','Ha','Heo','Jeon','Yoo']
    },
    'China': {
      f:['Wei','Fang','Yang','Jing','Li','Xiao','Hua','Lei','Mei','Hong','Xin','Ping','Jun','Feng','Hui','Tao','Yan','Zhen','Qing','Xue','Hao','Ling','Bo','Rui','Jian','Yun','Kun','Shu','Lan','Min'],
      l:['Wang','Li','Zhang','Liu','Chen','Yang','Huang','Zhao','Wu','Zhou','Xu','Sun','Ma','Zhu','Hu','Lin','Guo','He','Gao','Luo','Zheng','Liang','Xie','Tang','Han','Cao','Deng','Xiao','Peng','Dong']
    },
    'Indonesia': {
      f:['Budi','Siti','Agus','Dewi','Eko','Wati','Ahmad','Sri','Hendra','Indah','Rian','Putri','Reza','Dian','Bambang','Ani','Joko','Ratna','Fajar','Nurul','Bagas','Intan','Rizky','Ayu','Dimas','Nadia','Wahyu','Sari','Andi','Lestari'],
      l:['Santoso','Wijaya','Suharto','Kusuma','Pratama','Wibowo','Setiawan','Putra','Handoko','Rahayu','Susanto','Wahyudi','Kurniawan','Hidayat','Nugroho','Saputra','Hendrayana','Gunawan','Halim','Sutrisno','Suryadi','Budiman','Hartono','Salim','Tanaka','Sihombing','Manurung','Nasution','Harahap','Pardede']
    },
    'Philippines': {
      f:['Maria','Jose','Juan','Ana','Eduardo','Fernando','Isabel','Rosa','Miguel','Gloria','Pedro','Carmen','Ramon','Teresa','Mark','Grace','Liza','Rico','Maricel','Jun','Gina','Allan','Rowena','Rex','Lea','Arnel','Jenny','Rodel','Cheryl','Dennis'],
      l:['Santos','Reyes','Cruz','Bautista','Ocampo','Garcia','Gonzales','Hernandez','Flores','Ramos','Dela Cruz','Aquino','Mendoza','Torres','Castillo','Villanueva','Guevarra','Soriano','Dizon','Manalo','Pascual','Reyes','Domingo','Navarro','San Juan','Santiago','Bernardo','Magno','Delos Santos','Rivera']
    },
    'Thailand': {
      f:['Somchai','Malee','Somsak','Nong','Lek','Daeng','Wan','Pom','Nok','Joy','Fon','Pim','Mint','Art','Bank','Nid','Yai','Kai','Nan','Palm','Arm','Beam','Gift','Bow','Bew','Dear','Earth','Fame','Golf','Kwan'],
      l:['Charoenrat','Srisuk','Phongphit','Booncherd','Kittikul','Wongprasert','Sombat','Phanichphant','Leelahanon','Rattanakorn','Sukhonthapatipak','Pornprapha','Narongsak','Jiraprapa','Kanchana','Sukanya','Ratchanee','Siriporn','Nanthida','Wannapha','Chaiyasit','Jiraporn','Suriya','Panya','Chaiwat','Apinya','Thidarat','Supawan','Saowapa','Piyanuch']
    },
    'Brazil': {
      f:['João','Ana','Pedro','Maria','Lucas','Mariana','Matheus','Camila','Gustavo','Juliana','Felipe','Fernanda','Gabriel','Amanda','Rafael','Beatriz','Thiago','Larissa','Bruno','Isabela','Letícia','Rodrigo','Natália','Eduardo','Carolina','Leonardo','Gabriela','Henrique','Bruna','Diego'],
      l:['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Lima','Gomes','Costa','Ribeiro','Martins','Carvalho','Almeida','Lopes','Sousa','Fernandes','Vieira','Barbosa','Rocha','Dias','Monteiro','Cardoso','Mendes','Cunha','Teixeira','Freitas','Nascimento','Pinto']
    },
    'Argentina': {
      f:['Martín','Valentina','Santiago','Camila','Mateo','Sofía','Facundo','Florencia','Nicolás','Lucía','Diego','Agustina','Tomás','Micaela','Gustavo','Romina','Pablo','Natalia','Carlos','Valeria','Rodrigo','Paola','Mariano','Gabriela','Sebastián','Cecilia','Leandro','Verónica','Ezequiel','Claudia'],
      l:['González','Rodríguez','García','López','Martínez','Fernández','Pérez','Romero','Sosa','Torres','Ruiz','Flores','Acosta','Medina','Herrera','Molina','Morales','Díaz','Castro','Vargas','Jiménez','Suárez','Ramos','Álvarez','Gutiérrez','Gómez','Ortiz','Muñoz','Cabrera','Espínola']
    },
    'Chile': {
      f:['Matías','Valentina','Sebastián','Camila','Diego','Sofía','Nicolás','Catalina','Felipe','Francisca','Benjamín','Constanza','Pablo','Isidora','Rodrigo','Javiera','Tomás','Daniela','Ignacio','Antonia','Agustín','Fernanda','Cristóbal','Macarena','Javier','Martina','Andrés','Florencia','Lucas','Paula'],
      l:['Muñoz','González','Rojas','Díaz','Pérez','Soto','Contreras','Silva','Martínez','Sepúlveda','Morales','Torres','Flores','Rivera','Fuentes','Herrera','Miranda','Gómez','Reyes','Gutiérrez','Castro','Vargas','Jiménez','Fernández','López','Espinoza','Rodríguez','Poblete','Pizarro','Valenzuela']
    },
    'Mexico': {
      f:['José','María','Juan','Ana','Miguel','Guadalupe','Carlos','Claudia','Ricardo','Patricia','Roberto','Sandra','Jorge','Teresa','Antonio','Rosa','Luis','Jessica','Eduardo','Elizabeth','Fernando','Adriana','Alejandro','Verónica','Francisco','Daniela','Arturo','Leticia','Manuel','Karla'],
      l:['García','Martínez','Rodríguez','Hernández','López','González','Pérez','Sánchez','Ramírez','Torres','Flores','Díaz','Cruz','Morales','Reyes','Gutiérrez','Castillo','Jiménez','Vargas','Medina','Aguilar','Ortiz','Chávez','Ramos','Herrera','Mendoza','Ruiz','Rivera','Alvarado','Romero']
    },
    'South Africa': {
      f:['Themba','Zanele','Sipho','Nomsa','Bongani','Nhlanhla','Sifiso','Lerato','Ntombi','Lungelo','Jan','Pieter','Riaan','Anel','Liezel','Charmaine','David','Sarah','Michael','Emma','Deon','Kobus','Hein','Marna','Yusuf','Fatima','Priya','Ashwin','Naledi','Karabo'],
      l:['Dlamini','Nkosi','Khumalo','Mokoena','Mthembu','Sithole','Zulu','Nxumalo','Shabalala','Mahlangu','van der Merwe','Botha','Pretorius','du Plessis','Meyer','Venter','Pietersen','Joubert','Fourie','Nel','Patel','Singh','Khan','Mohammed','Okonkwo','Adeyemi','Abubakar','Mensah','Diallo','Traoré']
    },
    'Nigeria': {
      f:['Adebayo','Chioma','Emeka','Ngozi','Tunde','Adaeze','Yetunde','Chukwuemeka','Sola','Ifeoma','Musa','Fatima','Ibrahim','Aisha','Yusuf','Amina','Funmi','Nnamdi','Folake','Chinwe','Ade','Uju','Kunle','Nnenna','Femi','Obiageli','Seun','Chinyere','Wale','Akachi'],
      l:['Okonkwo','Adeyemi','Balogun','Ibrahim','Okafor','Abubakar','Chukwu','Eze','Nwosu','Olawale','Adeleke','Ogundipe','Babatunde','Nwachukwu','Afolabi','Ogunyemi','Adeniyi','Lawal','Salami','Oyewole','Mohammed','Usman','Musa','Hassan','Suleiman','Aliyu','Garba','Yusuf','Abdullahi','Idris']
    },
    'Kenya': {
      f:['Wanjiru','Kamau','Njeri','Odhiambo','Akinyi','Mwangi','Wambui','Otieno','Nyawira','Kimani','Adhiambo','Chebet','Korir','Chepkoech','Kibet','Faith','Grace','John','David','James','Peter','Mary','Sarah','Ruth','Hannah','Emmanuel','Joseph','Samuel','Daniel','Esther'],
      l:['Mwangi','Ochieng','Kamau','Otieno','Kipchoge','Ndegwa','Ngugi','Omondi','Waweru','Kariuki','Njoroge','Muthoni','Wanjiku','Auma','Onyango','Adhiambo','Mutua','Kiprotich','Langat','Cheruiyot','Korir','Yego','Kiptoo','Mutai','Ruto','Koros','Sang','Sigei','Bett','Rotich']
    },
    'Egypt': {
      f:['Mohamed','Fatima','Ahmed','Nour','Mahmoud','Sara','Ali','Mariam','Omar','Yasmine','Ibrahim','Dina','Youssef','Rana','Hassan','Heba','Khaled','Mona','Amr','Eman','Mostafa','Reem','Tarek','Nadia','Karim','Layla','Sherif','Mai','Walid','Doha'],
      l:['Hassan','Ahmed','Mohamed','Ibrahim','Ali','Mahmoud','Sayed','Mostafa','Khalil','Mansour','Farouk','Nasser','Saleh','Taha','Youssef','Kamel','Zaki','Amin','Fathy','Ramadan','Abd El-Rahman','El-Sayed','El-Sharkawy','Abdallah','Gomaa','Soliman','Osman','Badr','Gaber','Hegazy']
    },
    // ── Every other country, mapped to the language(s) it speaks ──
    'Switzerland':_DE,'Liechtenstein':_DE,
    'Luxembourg':_FR,'Monaco':_FR,'Haiti':_FR,"Ivory Coast":_FR,'Senegal':_FR,'Cameroon':_FR,'DR Congo':_FR,'Madagascar':_FR,
    'Denmark':_SC,'Sweden':_SC,'Norway':_SC,'Finland':_FI,'Iceland':_IS,
    'Poland':_PL,'Czech Republic':_CZ,'Slovakia':_CZ,'Hungary':_HU,'Romania':_RO,'Moldova':_RO,'Bulgaria':_BG,'Greece':_GR,'Cyprus':_GR,
    'Croatia':_SS,'Serbia':_SS,'Bosnia and Herzegovina':_SS,'Slovenia':_SS,'North Macedonia':_SS,'Montenegro':_SS,'Albania':_AL,'Kosovo':_AL,
    'Ukraine':_UA,'Belarus':_RU,'Russia':_RU,'Estonia':_EE,'Latvia':_LV,'Lithuania':_LT,
    'Malta':_IT,'San Marino':_IT,
    'Turkey':_TR,'Azerbaijan':_AZ,'Georgia':_GE,'Armenia':_AM,
    'Saudi Arabia':_AR,'United Arab Emirates':_AR,'Qatar':_AR,'Kuwait':_AR,'Bahrain':_AR,'Oman':_AR,'Yemen':_AR,'Jordan':_AR,'Lebanon':_AR,'Syria':_AR,'Iraq':_AR,'Palestine':_AR,
    'Morocco':_AR,'Algeria':_AR,'Tunisia':_AR,'Libya':_AR,'Sudan':_AR,
    'Israel':_HE,'Iran':_FA,'Afghanistan':_FA,'Tajikistan':_FA,
    'Pakistan':_UR,'Maldives':_UR,'Bangladesh':_BN,'Sri Lanka':_LK,'Nepal':_NP,'Bhutan':_NP,
    'Vietnam':_VN,'Cambodia':_KH,'Laos':_LA,'Myanmar':_MM,'Malaysia':_MS,'Brunei':_MS,
    'Taiwan':_ZH,'Hong Kong':_ZH,'Mongolia':_MN,
    'Kazakhstan':_CA,'Uzbekistan':_CA,'Kyrgyzstan':_CA,'Turkmenistan':_CA,
    'Ghana':_GH,'Ethiopia':_ET,'Tanzania':_SW,'Uganda':_SW,'Rwanda':_SW,
    'Angola':_PT,'Mozambique':_PT,
    'Zambia':_EN,'Zimbabwe':_EN,'Botswana':_EN,'Namibia':_EN,'Jamaica':_EN,'Trinidad and Tobago':_EN,'Fiji':_EN,'Papua New Guinea':_EN,
    'Colombia':_ES,'Peru':_ES,'Venezuela':_ES,'Ecuador':_ES,'Bolivia':_ES,'Paraguay':_ES,'Uruguay':_ES,'Cuba':_ES,'Dominican Republic':_ES,'Guatemala':_ES,'Costa Rica':_ES,'Panama':_ES,'Honduras':_ES,'El Salvador':_ES,'Nicaragua':_ES,
  };

  // Fallback for any country not listed above
  const NAMES_FALLBACK = {
    f:['Emma','Liam','Olivia','Noah','Ava','Sophia','James','Isabella','Oliver','Mia','Benjamin','Charlotte','Lucas','Harper','Mason','Evelyn'],
    l:['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Moore','Taylor','Anderson','Thomas','White','Harris','Martin']
  };

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
    // ── Every other country in the world ──
    {city:'Zürich', country:'Switzerland', lat:[47.31,47.43], lng:[8.45,8.61]},
    {city:'Vaduz', country:'Liechtenstein', lat:[47.08,47.20], lng:[9.46,9.58]},
    {city:'Luxembourg City', country:'Luxembourg', lat:[49.55,49.67], lng:[6.07,6.19]},
    {city:'Monte Carlo', country:'Monaco', lat:[43.69,43.76], lng:[7.39,7.45]},
    {city:'Copenhagen', country:'Denmark', lat:[55.62,55.74], lng:[12.51,12.63]},
    {city:'Stockholm', country:'Sweden', lat:[59.27,59.39], lng:[18.00,18.13]},
    {city:'Oslo', country:'Norway', lat:[59.85,59.97], lng:[10.69,10.81]},
    {city:'Helsinki', country:'Finland', lat:[60.11,60.23], lng:[24.88,25.00]},
    {city:'Reykjavík', country:'Iceland', lat:[64.09,64.21], lng:[-22.00,-21.82]},
    {city:'Warsaw', country:'Poland', lat:[52.17,52.29], lng:[20.95,21.07]},
    {city:'Prague', country:'Czech Republic', lat:[50.02,50.14], lng:[14.38,14.50]},
    {city:'Bratislava', country:'Slovakia', lat:[48.09,48.21], lng:[17.05,17.17]},
    {city:'Budapest', country:'Hungary', lat:[47.44,47.56], lng:[18.98,19.10]},
    {city:'Bucharest', country:'Romania', lat:[44.37,44.49], lng:[26.04,26.16]},
    {city:'Chișinău', country:'Moldova', lat:[46.95,47.07], lng:[28.80,28.92]},
    {city:'Sofia', country:'Bulgaria', lat:[42.64,42.76], lng:[23.26,23.38]},
    {city:'Athens', country:'Greece', lat:[37.92,38.04], lng:[23.67,23.79]},
    {city:'Nicosia', country:'Cyprus', lat:[35.11,35.23], lng:[33.30,33.42]},
    {city:'Zagreb', country:'Croatia', lat:[45.75,45.87], lng:[15.92,16.04]},
    {city:'Belgrade', country:'Serbia', lat:[44.73,44.85], lng:[20.39,20.51]},
    {city:'Sarajevo', country:'Bosnia and Herzegovina', lat:[43.80,43.92], lng:[18.35,18.47]},
    {city:'Ljubljana', country:'Slovenia', lat:[46.00,46.12], lng:[14.45,14.57]},
    {city:'Skopje', country:'North Macedonia', lat:[41.93,42.05], lng:[21.37,21.49]},
    {city:'Podgorica', country:'Montenegro', lat:[42.38,42.50], lng:[19.20,19.32]},
    {city:'Tirana', country:'Albania', lat:[41.27,41.39], lng:[19.76,19.88]},
    {city:'Pristina', country:'Kosovo', lat:[42.60,42.72], lng:[21.11,21.23]},
    {city:'Kyiv', country:'Ukraine', lat:[50.39,50.51], lng:[30.46,30.58]},
    {city:'Minsk', country:'Belarus', lat:[53.84,53.96], lng:[27.51,27.63]},
    {city:'Moscow', country:'Russia', lat:[55.69,55.81], lng:[37.56,37.68]},
    {city:'Tallinn', country:'Estonia', lat:[59.38,59.50], lng:[24.69,24.81]},
    {city:'Riga', country:'Latvia', lat:[56.89,57.01], lng:[24.05,24.17]},
    {city:'Vilnius', country:'Lithuania', lat:[54.63,54.75], lng:[25.22,25.34]},
    {city:'Valletta', country:'Malta', lat:[35.84,35.96], lng:[14.45,14.57]},
    {city:'San Marino', country:'San Marino', lat:[43.88,44.00], lng:[12.40,12.52]},
    {city:'Istanbul', country:'Turkey', lat:[40.95,41.07], lng:[28.92,29.04]},
    {city:'Baku', country:'Azerbaijan', lat:[40.35,40.47], lng:[49.81,49.93]},
    {city:'Tbilisi', country:'Georgia', lat:[41.66,41.78], lng:[44.73,44.85]},
    {city:'Yerevan', country:'Armenia', lat:[40.12,40.24], lng:[44.45,44.57]},
    {city:'Riyadh', country:'Saudi Arabia', lat:[24.65,24.77], lng:[46.62,46.74]},
    {city:'Dubai', country:'United Arab Emirates', lat:[25.14,25.26], lng:[55.21,55.33]},
    {city:'Doha', country:'Qatar', lat:[25.23,25.35], lng:[51.47,51.59]},
    {city:'Kuwait City', country:'Kuwait', lat:[29.32,29.44], lng:[47.93,48.05]},
    {city:'Manama', country:'Bahrain', lat:[26.17,26.29], lng:[50.53,50.65]},
    {city:'Muscat', country:'Oman', lat:[23.53,23.65], lng:[58.35,58.47]},
    {city:"Sana'a", country:'Yemen', lat:[15.31,15.43], lng:[44.13,44.25]},
    {city:'Amman', country:'Jordan', lat:[31.89,32.01], lng:[35.87,35.99]},
    {city:'Beirut', country:'Lebanon', lat:[33.83,33.95], lng:[35.44,35.56]},
    {city:'Damascus', country:'Syria', lat:[33.45,33.57], lng:[36.23,36.35]},
    {city:'Baghdad', country:'Iraq', lat:[33.25,33.37], lng:[44.30,44.42]},
    {city:'Ramallah', country:'Palestine', lat:[31.84,31.96], lng:[35.14,35.26]},
    {city:'Casablanca', country:'Morocco', lat:[33.51,33.63], lng:[-7.65,-7.53]},
    {city:'Algiers', country:'Algeria', lat:[36.69,36.81], lng:[3.00,3.12]},
    {city:'Tunis', country:'Tunisia', lat:[36.75,36.87], lng:[10.12,10.24]},
    {city:'Tripoli', country:'Libya', lat:[32.83,32.95], lng:[13.13,13.25]},
    {city:'Khartoum', country:'Sudan', lat:[15.44,15.56], lng:[32.50,32.62]},
    {city:'Tel Aviv', country:'Israel', lat:[32.02,32.14], lng:[34.72,34.84]},
    {city:'Tehran', country:'Iran', lat:[35.63,35.75], lng:[51.33,51.45]},
    {city:'Kabul', country:'Afghanistan', lat:[34.50,34.62], lng:[69.15,69.27]},
    {city:'Dushanbe', country:'Tajikistan', lat:[38.50,38.62], lng:[68.73,68.85]},
    {city:'Karachi', country:'Pakistan', lat:[24.80,24.92], lng:[66.95,67.07]},
    {city:'Malé', country:'Maldives', lat:[4.12,4.24], lng:[73.45,73.57]},
    {city:'Dhaka', country:'Bangladesh', lat:[23.75,23.87], lng:[90.35,90.47]},
    {city:'Colombo', country:'Sri Lanka', lat:[6.87,6.99], lng:[79.80,79.92]},
    {city:'Kathmandu', country:'Nepal', lat:[27.66,27.78], lng:[85.26,85.38]},
    {city:'Thimphu', country:'Bhutan', lat:[27.41,27.53], lng:[89.58,89.70]},
    {city:'Hanoi', country:'Vietnam', lat:[20.97,21.09], lng:[105.79,105.91]},
    {city:'Phnom Penh', country:'Cambodia', lat:[11.50,11.62], lng:[104.86,104.98]},
    {city:'Vientiane', country:'Laos', lat:[17.91,18.03], lng:[102.57,102.69]},
    {city:'Yangon', country:'Myanmar', lat:[16.81,16.93], lng:[96.14,96.26]},
    {city:'Kuala Lumpur', country:'Malaysia', lat:[3.08,3.20], lng:[101.63,101.75]},
    {city:'Bandar Seri Begawan', country:'Brunei', lat:[4.84,4.96], lng:[114.88,115.00]},
    {city:'Taipei', country:'Taiwan', lat:[24.97,25.09], lng:[121.51,121.63]},
    {city:'Hong Kong', country:'Hong Kong', lat:[22.26,22.38], lng:[114.11,114.23]},
    {city:'Ulaanbaatar', country:'Mongolia', lat:[47.83,47.95], lng:[106.85,106.97]},
    {city:'Almaty', country:'Kazakhstan', lat:[43.18,43.30], lng:[76.83,76.95]},
    {city:'Tashkent', country:'Uzbekistan', lat:[41.25,41.37], lng:[69.18,69.30]},
    {city:'Bishkek', country:'Kyrgyzstan', lat:[42.81,42.93], lng:[74.53,74.65]},
    {city:'Ashgabat', country:'Turkmenistan', lat:[37.90,38.02], lng:[58.27,58.39]},
    {city:'Accra', country:'Ghana', lat:[5.54,5.66], lng:[-0.25,-0.13]},
    {city:'Abidjan', country:'Ivory Coast', lat:[5.30,5.42], lng:[-4.07,-3.95]},
    {city:'Dakar', country:'Senegal', lat:[14.66,14.78], lng:[-17.53,-17.41]},
    {city:'Douala', country:'Cameroon', lat:[3.99,4.11], lng:[9.71,9.83]},
    {city:'Kinshasa', country:'DR Congo', lat:[-4.38,-4.26], lng:[15.25,15.37]},
    {city:'Antananarivo', country:'Madagascar', lat:[-18.94,-18.82], lng:[47.45,47.57]},
    {city:'Addis Ababa', country:'Ethiopia', lat:[8.97,9.09], lng:[38.68,38.80]},
    {city:'Dar es Salaam', country:'Tanzania', lat:[-6.85,-6.73], lng:[39.15,39.27]},
    {city:'Kampala', country:'Uganda', lat:[0.29,0.41], lng:[32.52,32.64]},
    {city:'Kigali', country:'Rwanda', lat:[-2.00,-1.88], lng:[30.00,30.12]},
    {city:'Luanda', country:'Angola', lat:[-8.90,-8.78], lng:[13.17,13.29]},
    {city:'Maputo', country:'Mozambique', lat:[-26.03,-25.91], lng:[32.51,32.63]},
    {city:'Lusaka', country:'Zambia', lat:[-15.48,-15.36], lng:[28.22,28.34]},
    {city:'Harare', country:'Zimbabwe', lat:[-17.89,-17.77], lng:[30.99,31.11]},
    {city:'Gaborone', country:'Botswana', lat:[-24.71,-24.59], lng:[25.85,25.97]},
    {city:'Windhoek', country:'Namibia', lat:[-22.62,-22.50], lng:[17.02,17.14]},
    {city:'Kingston', country:'Jamaica', lat:[17.91,18.03], lng:[-76.85,-76.73]},
    {city:'Port of Spain', country:'Trinidad and Tobago', lat:[10.60,10.72], lng:[-61.58,-61.46]},
    {city:'Suva', country:'Fiji', lat:[-18.20,-18.08], lng:[178.38,178.50]},
    {city:'Port Moresby', country:'Papua New Guinea', lat:[-9.50,-9.38], lng:[147.12,147.24]},
    {city:'Port-au-Prince', country:'Haiti', lat:[18.53,18.65], lng:[-72.37,-72.25]},
    {city:'Bogotá', country:'Colombia', lat:[4.65,4.77], lng:[-74.13,-74.01]},
    {city:'Lima', country:'Peru', lat:[-12.11,-11.99], lng:[-77.10,-76.98]},
    {city:'Caracas', country:'Venezuela', lat:[10.43,10.55], lng:[-66.94,-66.82]},
    {city:'Quito', country:'Ecuador', lat:[-0.24,-0.12], lng:[-78.53,-78.41]},
    {city:'La Paz', country:'Bolivia', lat:[-16.56,-16.44], lng:[-68.21,-68.09]},
    {city:'Asunción', country:'Paraguay', lat:[-25.34,-25.22], lng:[-57.70,-57.58]},
    {city:'Montevideo', country:'Uruguay', lat:[-34.96,-34.84], lng:[-56.22,-56.10]},
    {city:'Havana', country:'Cuba', lat:[23.05,23.17], lng:[-82.43,-82.31]},
    {city:'Santo Domingo', country:'Dominican Republic', lat:[18.43,18.55], lng:[-69.99,-69.87]},
    {city:'Guatemala City', country:'Guatemala', lat:[14.57,14.69], lng:[-90.57,-90.45]},
    {city:'San José', country:'Costa Rica', lat:[9.87,9.99], lng:[-84.14,-84.02]},
    {city:'Panama City', country:'Panama', lat:[8.92,9.04], lng:[-79.58,-79.46]},
    {city:'Tegucigalpa', country:'Honduras', lat:[14.01,14.13], lng:[-87.25,-87.13]},
    {city:'San Salvador', country:'El Salvador', lat:[13.63,13.75], lng:[-89.28,-89.16]},
    {city:'Managua', country:'Nicaragua', lat:[12.05,12.17], lng:[-86.30,-86.18]},
  ];

  const STREETS = ['Maple St','Oak Ave','Cedar Rd','Pine St','Elm St','River Rd','Park Ave',
    'Hill Dr','Lake Rd','Forest Lane','Main St','Church St','School Rd','Garden Ave',
    'Valley Rd','Sunset Blvd','High St','Broadway','Station Rd','Beach Rd','Bay St',
    'Creek Rd','Mountain View Dr','Willows Way','Birchwood Ln','Rosewood Ave','Meadow Lane'];

  const ANIMALS = ['Dog','Dog','Dog','Dog','Cat','Cat','Cat','Cat','Rabbit','Bird','Hamster','Other'];

  const PHOTO_TAG = {
    'Dog': 'dog,puppy', 'Cat': 'cat,kitten', 'Rabbit': 'rabbit',
    'Bird': 'bird,parrot', 'Hamster': 'hamster', 'Other': 'pet,animal'
  };
  const TOTAL = 3246, PHOTO_N = 214;

  const now = Date.now();

  const pets = [];
  let photoIdx = 0;
  for (let i = 0; i < TOTAL; i++) {
    const region = pick(CITY_REGIONS);
    const animal = pick(ANIMALS);
    const isLost = chance(0.62);
    const isReunited = !isLost ? false : chance(0.14);
    const daysAgo = ri(1, 700);
    const postDate = new Date(now - daysAgo * 86400000);
    const dateStr = postDate.toISOString().split('T')[0];
    const nameSet = NAMES[region.country] || NAMES_FALLBACK;
    const firstName = pick(nameSet.f);
    const lastName = pick(nameSet.l);
    const hasPhone = chance(0.75);
    const hasEmail = !hasPhone || chance(0.6);

    let breed = '';
    if (animal === 'Dog') breed = pick(DOG_BREEDS);
    else if (animal === 'Cat') breed = pick(CAT_BREEDS);
    else if (animal === 'Rabbit') breed = pick(['Holland Lop','Mini Rex','Lionhead','Dutch','Flemish Giant','Mixed']);
    else if (animal === 'Bird') breed = pick(['Budgie','Cockatiel','Parrot','Canary','Lovebird','Finch']);

    const lat = region.lat[0] + rng() * (region.lat[1] - region.lat[0]);
    const lng = region.lng[0] + rng() * (region.lng[1] - region.lng[0]);

    // Evenly distribute 214 photos across all 3246 pets (Bresenham distribution)
    const wantPhoto = Math.floor((i + 1) * PHOTO_N / TOTAL) > Math.floor(i * PHOTO_N / TOTAL);
    let photoUrl = null;
    if (wantPhoto) {
      photoIdx++;
      const tag = PHOTO_TAG[animal] || 'pet';
      const lock = ((photoIdx - 1) % 99) + 1;
      photoUrl = `https://loremflickr.com/300/200/${tag}?lock=${lock}`;
    }

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
      photo_url: photoUrl,
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
