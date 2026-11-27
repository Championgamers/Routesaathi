/* ---------- CITIES DATABASE ---------- */
const CITIES=`Delhi,28.61,77.21,AH;Mumbai,19.07,72.88,AH;Kolkata,22.57,88.36,AH;Chennai,13.08,80.27,AH;Bengaluru,12.97,77.59,AH;Hyderabad,17.39,78.49,AH;Ahmedabad,23.02,72.57,AH;Pune,18.52,73.86,AH;Jaipur,26.91,75.79,AH;Lucknow,26.85,80.95,AH;Patna,25.59,85.14,AH;Bhopal,23.26,77.41,AH;Nagpur,21.15,79.09,AH;Guwahati,26.14,91.74,AH;DDU Junction,25.28,83.12,H;Kanpur,26.45,80.33,H;Prayagraj,25.44,81.85,AH;Itarsi,22.61,77.76,H;Jhansi,25.45,78.57,H;Kota,25.21,75.86,H;Vijayawada,16.51,80.65,AH;Ranchi,23.34,85.31,AH;Bhubaneswar,20.30,85.82,AH;Chandigarh,30.73,76.78,AH;Surat,21.17,72.83,AH;Indore,22.72,75.86,AH;Raipur,21.25,81.63,AH;Visakhapatnam,17.69,83.22,AH;Varanasi,25.32,82.97,AH;Gorakhpur,26.76,83.37,AH;Siliguri,26.73,88.40,AH;
Agra,27.18,78.01,A;Ajmer,26.45,74.64,;Aligarh,27.88,78.08,;Alwar,27.55,76.63,;Amritsar,31.63,74.87,A;Aurangabad,19.88,75.34,A;Ayodhya,26.80,82.20,A;Bareilly,28.37,79.43,A;Belagavi,15.85,74.50,A;Bhagalpur,25.24,86.97,;Bhavnagar,21.76,72.15,A;Bikaner,28.02,73.31,A;Bilaspur,22.08,82.15,A;Bokaro,23.67,86.15,;Coimbatore,11.02,76.96,A;Cuttack,20.46,85.88,;Darbhanga,26.15,85.90,A;Dehradun,30.32,78.03,A;Dhanbad,23.80,86.43,;Dibrugarh,27.47,94.91,A;Durgapur,23.52,87.31,A;Gaya,24.80,85.00,A;Goa,15.36,73.95,A;Guntur,16.31,80.44,;Gurugram,28.46,77.03,;Gwalior,26.22,78.18,A;Haridwar,29.95,78.16,;Hisar,29.15,75.72,;Hubballi,15.36,75.12,A;Imphal,24.82,93.94,AN;Agartala,23.83,91.28,A;Aizawl,23.73,92.72,AN;Shillong,25.58,91.89,AN;Kohima,25.67,94.11,N;Itanagar,27.08,93.61,A;Gangtok,27.33,88.61,N;Jabalpur,23.18,79.99,A;Jalandhar,31.33,75.58,;Jammu,32.73,74.86,A;Jamnagar,22.47,70.06,A;Jamshedpur,22.80,86.20,A;Jodhpur,26.24,73.02,A;Jaisalmer,26.92,70.91,A;Kannur,11.87,75.37,A;Kanyakumari,8.09,77.54,;Kochi,9.93,76.27,A;Kolhapur,16.70,74.24,A;Kozhikode,11.26,75.78,A;Leh,34.15,77.58,AN;Ludhiana,30.90,75.86,;Madurai,9.93,78.12,A;Manali,32.24,77.19,N;Mangaluru,12.91,74.86,A;Mathura,27.49,77.67,;Meerut,28.98,77.71,;Moradabad,28.84,78.77,;Muzaffarpur,26.12,85.36,;Mysuru,12.30,76.64,A;Nainital,29.38,79.45,N;Nashik,20.00,73.79,A;Nellore,14.44,79.99,;Noida,28.54,77.39,;Panipat,29.39,76.96,;Pathankot,32.27,75.65,A;Puducherry,11.94,79.81,A;Puri,19.81,85.83,;Purnia,25.78,87.47,A;Rajkot,22.30,70.80,A;Rishikesh,30.09,78.27,;Rourkela,22.26,84.85,A;Salem,11.66,78.15,A;Shimla,31.10,77.17,N;Sikar,27.61,75.14,;Solapur,17.66,75.91,A;Srinagar,34.08,74.80,A;Thanjavur,10.79,79.14,;Thiruvananthapuram,8.52,76.94,A;Thrissur,10.53,76.21,;Tiruchirappalli,10.79,78.70,A;Tirupati,13.63,79.42,A;Tirunelveli,8.71,77.76,;Udaipur,24.59,73.71,A;Ujjain,23.18,75.78,;Vadodara,22.31,73.18,A;Vellore,12.92,79.13,;Warangal,17.97,79.59,;
Amravati,20.93,77.75,;Akola,20.71,77.00,;Ambala,30.38,76.78,;Anand,22.56,72.95,;Anantapur,14.68,77.60,;Asansol,23.68,86.98,H;Bathinda,30.21,74.95,A;Berhampur,19.31,84.79,;Bhilai,21.19,81.38,;Bhuj,23.25,69.67,A;Bhusawal,21.05,75.79,H;Vijayapura,16.83,75.71,A;Burdwan,23.24,87.86,;Chhindwara,22.06,78.94,;Chittorgarh,24.88,74.63,;Daman,20.40,72.83,A;Deoghar,24.48,86.70,A;Dhule,20.90,74.77,;Dimapur,25.91,93.73,A;Erode,11.34,77.72,;Faridabad,28.41,77.31,;Firozpur,30.93,74.61,;Gandhinagar,23.22,72.65,;Gonda,27.13,81.96,;Jalgaon,21.01,75.57,A;Karnal,29.69,76.99,;Katihar,25.54,87.57,;Khajuraho,24.83,79.92,A;Kharagpur,22.35,87.32,H;Kishangarh,26.59,74.86,A;Kollam,8.89,76.61,;Kurnool,15.83,78.04,;Latur,18.40,76.58,;Malda,25.01,88.14,;Nanded,19.15,77.32,A;Navsari,20.95,72.92,;Ongole,15.50,80.05,;Palakkad,10.78,76.65,;Patiala,30.34,76.39,;Porbandar,21.64,69.60,A;Raebareli,26.23,81.23,;Rajahmundry,17.00,81.80,A;Ratlam,23.33,75.04,H;Rewa,24.53,81.30,;Rohtak,28.89,76.61,;Sagar,23.84,78.74,;Saharanpur,29.96,77.55,;Satna,24.60,80.83,;Sambalpur,21.47,83.97,A;Shirdi,19.77,74.48,A;Silchar,24.83,92.78,A;Tezpur,26.63,92.80,A;Thane,19.22,72.98,;Tinsukia,27.49,95.36,;Tiruppur,11.11,77.34,;Udhampur,32.92,75.14,;Vapi,20.37,72.91,;Rameswaram,9.29,79.31,;Ooty,11.41,76.70,N;Munnar,10.09,77.06,N;Darjeeling,27.04,88.26,N;Kodaikanal,10.24,77.49,N;Mussoorie,30.46,78.07,N;Pushkar,26.49,74.55,N;Mount Abu,24.59,72.71,N;Dharamshala,32.22,76.32,AN;Kullu,31.96,77.11,AN;Bodh Gaya,24.70,84.99,;Sasaram,24.95,84.03,;Buxar,25.57,83.98,;Hajipur,25.69,85.21,;Samastipur,25.86,85.78,;Barauni,25.47,86.00,H;Begusarai,25.42,86.13,;Saharsa,25.88,86.60,;Siwan,26.22,84.36,;Chapra,25.78,84.73,;Raxaul,26.98,84.85,;Sitamarhi,26.60,85.49,;Motihari,26.65,84.92,;Arrah,25.56,84.67,;Aurangabad Bihar,24.75,84.37,;Jehanabad,25.21,84.99,;Nawada,24.89,85.54,`
.split(';').map(s=>{const [n,a,o,f]=s.trim().split(',');return{n,lat:+a,lon:+o,air:f.includes('A'),hub:f.includes('H'),rail:!f.includes('N')}});
const BY=Object.fromEntries(CITIES.map(c=>[c.n.toLowerCase(),c]));
const ALIAS={bangalore:'bengaluru',bombay:'mumbai',calcutta:'kolkata',madras:'chennai',allahabad:'prayagraj',banaras:'varanasi',benaras:'varanasi','new delhi':'delhi',gurgaon:'gurugram',cochin:'kochi',trivandrum:'thiruvananthapuram',mysore:'mysuru',mangalore:'mangaluru',trichy:'tiruchirappalli',pondicherry:'puducherry',vizag:'visakhapatnam',baroda:'vadodara',mughalsarai:'ddu junction',hubli:'hubballi',belgaum:'belagavi'};
for(const [n,lat,lon,air,island] of [['Port Blair',11.67,92.74,true,true],['Agatti',10.86,72.18,true,true],['Daman',20.40,72.83,false,false],['Silvassa',20.27,73.00,false,false]])
 if(!BY[n.toLowerCase()]){const c={n,lat,lon,air,hub:false,rail:false,island};CITIES.push(c);BY[n.toLowerCase()]=c}
 for(const row of `Abohar,30.14,74.20,;Adilabad,19.67,78.53,;Ahmednagar,19.09,74.75,;Akola,20.71,77.00,;Alappuzha,9.50,76.34,;Ambala,30.38,76.78,;Ambikapur,23.12,83.20,;Amravati,20.93,77.75,;Anand,22.56,72.95,;Anantapur,14.68,77.60,;Ara,25.56,84.66,;Asansol,23.68,86.98,;Azamgarh,26.07,83.18,;Balasore,21.49,86.93,;Ballari,15.14,76.92,;Ballia,25.76,84.15,;Banda,25.48,80.34,;Bankura,23.23,87.07,;Banswara,23.55,74.44,;Baramulla,34.20,74.34,N;Barmer,25.75,71.39,;Bathinda,30.21,74.95,;Begusarai,25.42,86.13,;Berhampur,19.31,84.79,;Betul,21.90,77.90,;Bettiah,26.80,84.50,;Bharatpur,27.22,77.49,;Bharuch,21.71,72.98,;Bhilwara,25.35,74.64,;Bhiwani,28.79,76.14,;Bhuj,23.24,69.67,A;Bidar,17.91,77.52,A;Bihar Sharif,25.20,85.52,;Bulandshahr,28.41,77.85,;Burhanpur,21.31,76.23,;Buxar,25.56,83.98,;Chandrapur,19.96,79.30,;Chapra,25.78,84.75,;Chhindwara,22.06,78.94,;Chittoor,13.22,79.10,;Chittorgarh,24.88,74.63,;Churu,28.30,74.97,;Cuddapah,14.47,78.82,A;Dahod,22.84,74.26,;Daltonganj,24.04,84.07,;Damoh,23.84,79.44,;Davanagere,14.46,75.92,;Deoghar,24.48,86.70,A;Deoria,26.50,83.78,;Dewas,22.97,76.05,;Dharamshala,32.22,76.32,AN;Dharwad,15.46,75.01,;Dhule,20.90,74.77,;Dimapur,25.91,93.73,A;Dindigul,10.36,77.97,;Dumka,24.27,87.25,;Eluru,16.71,81.10,;Erode,11.34,77.72,;Etawah,26.78,79.02,;Faridabad,28.41,77.31,;Farrukhabad,27.39,79.58,;Fatehpur,25.93,80.81,;Firozpur,30.93,74.61,;Gadag,15.43,75.63,;Gandhidham,23.08,70.13,;Gandhinagar,23.22,72.65,;Ganganagar,29.90,73.88,;Ghaziabad,28.67,77.45,;Giridih,24.19,86.30,;Gonda,27.13,81.96,;Gondia,21.46,80.19,A;Gopalganj,26.47,84.44,;Guna,24.65,77.31,;Gurdaspur,32.04,75.41,;Hajipur,25.69,85.21,;Haldwani,29.22,79.51,;Hamirpur,31.68,76.52,N;Hanumangarh,29.58,74.33,;Hapur,28.73,77.78,;Hardoi,27.39,80.13,;Hassan,13.01,76.10,;Haveri,14.79,75.40,;Hazaribagh,23.99,85.36,;Hosur,12.74,77.83,;Hoshangabad,22.75,77.72,;Hoshiarpur,31.53,75.91,;Hospet,15.27,76.39,;Howrah,22.59,88.31,;Ichalkaranji,16.69,74.46,;Jagdalpur,19.07,82.02,A;Jalgaon,21.01,75.56,A;Jalna,19.84,75.88,;Jalpaiguri,26.52,88.73,;Jaunpur,25.75,82.68,;Jehanabad,25.21,84.99,;Jhalawar,24.60,76.16,;Jhunjhunu,28.13,75.40,;Jind,29.32,76.31,;Jorhat,26.75,94.20,A;Junagadh,21.52,70.46,;Kaithal,29.80,76.40,;Kakinada,16.99,82.25,;Kalaburagi,17.33,76.83,A;Kalyan,19.24,73.13,;Kanchipuram,12.84,79.70,;Kargil,34.56,76.13,N;Karimnagar,18.44,79.13,;Karnal,29.69,76.99,;Karur,10.96,78.08,;Karwar,14.81,74.13,;Kasaragod,12.50,74.99,;Kathua,32.37,75.52,;Katihar,25.54,87.57,;Katni,23.83,80.39,;Khajuraho,24.85,79.92,A;Khammam,17.25,80.15,;Khandwa,21.83,76.35,;Kharagpur,22.35,87.23,;Khargone,21.82,75.61,;Kishanganj,26.09,87.94,;Kokrajhar,26.40,90.27,;Kolar,13.14,78.13,;Kollam,8.89,76.61,;Korba,22.35,82.68,;Kottayam,9.59,76.52,;Krishnanagar,23.40,88.50,;Kumbakonam,10.96,79.39,;Kurnool,15.83,78.04,A;Kurukshetra,29.97,76.88,;Lakhimpur,27.95,80.78,;Latur,18.41,76.56,A;Machilipatnam,16.19,81.14,;Mahbubnagar,16.74,77.99,;Mahesana,23.59,72.37,;Mainpuri,27.23,79.02,;Malda,25.01,88.14,;Mandi,31.71,76.93,N;Mandsaur,24.07,75.07,;Mandya,12.52,76.90,;Margao,15.27,73.96,;Mau,25.94,83.56,;Medinipur,22.42,87.32,;Mirzapur,25.15,82.57,;Moga,30.82,75.17,;Mokama,25.39,85.92,;Morbi,22.81,70.84,;Morena,26.50,78.00,;Motihari,26.65,84.92,;Munger,25.37,86.47,;Muzaffarnagar,29.47,77.70,;Nadiad,22.69,72.86,;Nagaon,26.35,92.69,;Nagaur,27.20,73.74,;Nagercoil,8.18,77.43,;Nalgonda,17.05,79.27,;Namakkal,11.22,78.17,N;Nanded,19.15,77.32,A;Nandurbar,21.37,74.24,;Navsari,20.95,72.93,;Nawada,24.89,85.54,;Neemuch,24.47,74.87,;New Jalpaiguri,26.68,88.44,;Nizamabad,18.67,78.09,;Ongole,15.50,80.05,;Orai,25.99,79.45,;Ooty,11.41,76.70,;Palakkad,10.78,76.65,;Palanpur,24.17,72.43,;Pali,25.77,73.32,;Palwal,28.14,77.33,;Panaji,15.50,73.83,N;Panchkula,30.69,76.86,;Parbhani,19.27,76.78,;Patan,23.85,72.13,;Pathanamthitta,9.26,76.79,N;Patiala,30.34,76.39,;Pilibhit,28.63,79.80,;Porbandar,21.64,69.61,A;Pratapgarh,25.89,81.94,;Proddatur,14.75,78.55,;Pudukkottai,10.38,78.82,;Purulia,23.33,86.36,;Raebareli,26.22,81.24,;Raichur,16.20,77.35,;Raiganj,25.62,88.12,;Raigarh,21.90,83.40,;Rajahmundry,17.00,81.80,A;Rajnandgaon,21.10,81.03,;Rajsamand,25.07,73.88,;Ramagundam,18.76,79.47,;Ramanathapuram,9.37,78.83,;Rameswaram,9.29,79.31,;Rampur,28.80,79.03,;Ratlam,23.33,75.04,;Ratnagiri,16.99,73.30,;Rewa,24.53,81.30,A;Rewari,28.20,76.62,;Rohtak,28.90,76.61,;Roorkee,29.87,77.89,;Sagar,23.84,78.74,;Saharanpur,29.97,77.55,;Saharsa,25.88,86.60,;Sambalpur,21.47,83.97,A;Sambhal,28.58,78.57,;Samastipur,25.86,85.78,;Sangli,16.85,74.58,;Sasaram,24.95,84.03,;Satara,17.68,74.00,;Satna,24.60,80.83,;Sawai Madhopur,26.02,76.35,;Sehore,23.20,77.08,;Seoni,22.09,79.55,;Shahdol,23.30,81.36,;Shahjahanpur,27.88,79.91,;Shivamogga,13.93,75.57,A;Shivpuri,25.42,77.66,;Silchar,24.83,92.78,A;Singrauli,24.20,82.67,;Sirohi,24.89,72.86,;Sirsa,29.53,75.03,;Sitamarhi,26.59,85.49,;Sitapur,27.57,80.68,;Sivakasi,9.45,77.80,;Siwan,26.22,84.36,;Solan,30.91,77.10,;Sonipat,28.99,77.02,;Srikakulam,18.30,83.90,;Sultanpur,26.26,82.07,;Surendranagar,22.73,71.64,;Tezpur,26.63,92.80,A;Thane,19.22,72.98,;Thoothukudi,8.76,78.13,A;Tinsukia,27.49,95.36,;Tiruppur,11.11,77.34,;Tiruvannamalai,12.23,79.07,;Tonk,26.17,75.79,N;Tumakuru,13.34,77.10,;Udhampur,32.92,75.14,;Udupi,13.34,74.75,;Unnao,26.55,80.49,;Vapi,20.37,72.90,;Vasco,15.40,73.81,;Veraval,20.91,70.36,;Vidisha,23.52,77.81,;Villupuram,11.94,79.49,;Virudhunagar,9.58,77.96,;Vizianagaram,18.11,83.40,;Wardha,20.74,78.60,;Washim,20.11,77.13,;Yamunanagar,30.13,77.29,;Yavatmal,20.39,78.12,`.split(';')){const [n,lat,lon,f='']=row.split(',');
 if(!BY[n.toLowerCase()]){const c={n,lat:+lat,lon:+lon,air:f.includes('A'),hub:false,rail:!f.includes('N')};CITIES.push(c);BY[n.toLowerCase()]=c}}
for(const c of CITIES)if(c.n==='Kochi')c.hub=true;

const find=s=>{s=s.trim().toLowerCase();return BY[ALIAS[s]||s]};

/* ---------- REAL INDIAN STATION CODES (IRCTC) & AIRPORT CODES (IATA) ---------- */
const CODES={
 delhi:['NDLS','DEL'],mumbai:['MMCT','BOM'],kolkata:['HWH','CCU'],chennai:['MAS','MAA'],
 bengaluru:['SBC','BLR'],hyderabad:['SC','HYD'],ahmedabad:['ADI','AMD'],pune:['PUNE','PNQ'],
 jaipur:['JP','JAI'],lucknow:['LKO','LKO'],patna:['PNBE','PAT'],bhopal:['BPL','BHO'],
 nagpur:['NGP','NAG'],guwahati:['GHY','GAU'],'ddu junction':['DDU',''],kanpur:['CNB','KNU'],
 prayagraj:['PRYJ','IXD'],itarsi:['ET',''],jhansi:['VGLJ',''],kota:['KOTA',''],
 vijayawada:['BZA','VGA'],ranchi:['RNC','IXR'],bhubaneswar:['BBS','BBI'],chandigarh:['CDG','IXC'],
 surat:['ST','STV'],indore:['INDB','IDR'],raipur:['R','RPR'],visakhapatnam:['VSKP','VTZ'],
 varanasi:['BSB','VNS'],gorakhpur:['GKP','GOP'],siliguri:['NJP','IXB'],agra:['AGC','AGR'],
 ajmer:['AII',''],amritsar:['ASR','ATQ'],aurangabad:['AWB','IXU'],ayodhya:['AY','AYJ'],
 coimbatore:['CBE','CJB'],darbhanga:['DBG','DBR'],dehradun:['DDN','DED'],deoghar:['DGHR','DGH'],
 dhanbad:['DHN',''],gaya:['GAYA','GAY'],goa:['MAO','GOI'],gwalior:['GWL','GWL'],
 haridwar:['HW',''],jammu:['JAT','IXJ'],jamshedpur:['TATA',''],jodhpur:['JU','JDH'],
 jaisalmer:['JSM','JSA'],kochi:['ERS','COK'],madurai:['MDU','IXM'],mangaluru:['MAQ','IXE'],
 mysuru:['MYS','MYQ'],nashik:['NK','ISK'],puducherry:['PDY','PNY'],puri:['PURI',''],
 rajkot:['RJT','HSR'],shirdi:['SNSI','SAG'],srinagar:['SINA','SXR'],thiruvananthapuram:['TVC','TRV'],
 tirupati:['TPTY','TIR'],udaipur:['UDZ','UDR'],ujjain:['UJN',''],vadodara:['BRC','BDQ'],
 leh:['','IXL'],'port blair':['','IXZ'],dharamshala:['','DHM'],kullu:['','KUU'],
 howrah:['HWH','CCU'],muzaffarpur:['MFP',''],bhagalpur:['BGP',''],barauni:['BJU',''],
 sasaram:['SSM',''],buxar:['BXR',''],arrah:['ARA',''],samastipur:['SPJ','']
};
const stnCode=c=>(CODES[c.n.toLowerCase()]||['',''])[0];
const airCode=c=>(CODES[c.n.toLowerCase()]||['',''])[1];
const cityCodeTag=(c,m)=>{
 const k=m==='flight'?airCode(c):m==='train'?stnCode(c):'';
 return k?`<span class="code-tag">${k}</span>`:'';
};

/* ---------- VERIFIED INDIAN CORRIDOR TIMETABLES (REAL TRAIN NUMBERS, AIRLINES & BUS OPERATORS) ---------- */
/* Format per corridor key "cityA|cityB" (bidirectional):
   train: [num, name, depMin, durMin, baseSL_fare, isRajdhaniOrVB (noSL)]
   flight: [code, airline, depMin, durMin, baseEcoFare]
   bus: [operator, depMin, durMin, baseFare]
*/
const REAL_CORRIDORS={
 'mumbai|delhi':{
  train:[['12951','Mumbai–New Delhi Tejas Rajdhani',1020,932,1020,true],['12903','Golden Temple Mail SF',1125,1160,620,false]],
  flight:[['6E 5318','IndiGo Non-stop',440,130,5450],['AI 806','Air India Non-stop',600,135,6100]],
  bus:[['IntrCity SmartBus Volvo AC',1080,1470,2150]]
 },
 'delhi|mumbai':{
  train:[['12952','New Delhi–Mumbai Tejas Rajdhani',1015,940,1020,true],['12904','Golden Temple Mail SF',240,1175,620,false]],
  flight:[['6E 5012','IndiGo Non-stop',480,135,5500],['AI 865','Air India Non-stop',630,135,6150]],
  bus:[['IntrCity SmartBus Volvo AC',1110,1480,2150]]
 },
 'patna|delhi':{
  train:[['12393','Sampoorna Kranti SF Express',1180,735,510,false,true],['12309','Rajendra Nagar Tejas Rajdhani',1150,750,890,true,true]],
  flight:[['6E 2483','IndiGo Non-stop',540,105,4650],['AI 408','Air India Non-stop',885,110,5200]],
  bus:[['Zingbus / UPSRTC AC Sleeper',1020,1005,1480]]
 },
 'delhi|patna':{
  train:[['12394','Sampoorna Kranti SF Express',1050,765,510,false],['12310','New Delhi–RJPB Tejas Rajdhani',1030,755,890,true]],
  flight:[['6E 2184','IndiGo Non-stop',490,100,4600],['AI 407','Air India Non-stop',810,105,5150]],
  bus:[['Zingbus / UPSRTC AC Sleeper',1050,990,1480]]
 },
 'jaipur|patna':{
  train:[['12396','Ziyarat Superfast Express',155,1190,530,false],['15631','Barmer–Guwahati Express',550,1140,515,false]],
  flight:[['6E 6142','IndiGo Non-stop',615,110,5100]],
  bus:[['IntrCity / Panwar AC Sleeper',1020,1230,1650]]
 },
 'patna|jaipur':{
  train:[['12395','Ziyarat Superfast Express',1095,1215,530,false],['15632','Guwahati–Barmer Express',270,1160,515,false]],
  flight:[['6E 6143','IndiGo Non-stop',760,115,5150]],
  bus:[['IntrCity / Panwar AC Sleeper',990,1245,1650]]
 },
 'jaipur|delhi':{
  train:[['20977','Ajmer–Delhi Vande Bharat Exp',470,220,560,true],['12016','Ajmer–New Delhi Shatabdi',1070,265,520,true],['22996','Mandore SF Express',1240,310,235,false]],
  flight:[['6E 2178','IndiGo Non-stop',450,65,3150],['AI 492','Air India Non-stop',840,70,3650]],
  bus:[['RSRTC Volvo / NueGo Electric',420,315,620]]
 },
 'delhi|jaipur':{
  train:[['20978','Delhi–Ajmer Vande Bharat Exp',1108,217,560,true],['12015','New Delhi–Ajmer Shatabdi',370,265,520,true],['22995','Mandore SF Express',1280,305,235,false]],
  flight:[['6E 2177','IndiGo Non-stop',360,65,3100],['AI 491','Air India Non-stop',750,70,3600]],
  bus:[['RSRTC Volvo / NueGo Electric',450,310,620]]
 },
 'jaipur|mumbai':{
  train:[['12956','Jaipur–Mumbai Central SF Exp',840,1015,545,false],['12215','Delhi–Bandra Garib Rath',855,1040,460,true]],
  flight:[['QP 1344','Akasa Air Non-stop',510,115,4450],['6E 512','IndiGo Non-stop',900,115,4750]],
  bus:[['Shrinath / IntrCity AC Sleeper',960,1245,1750]]
 },
 'mumbai|jaipur':{
  train:[['12955','Mumbai Central–Jaipur SF Exp',1145,1035,545,false]],
  flight:[['QP 1343','Akasa Air Non-stop',420,110,4400],['6E 511','IndiGo Non-stop',825,115,4700]],
  bus:[['Shrinath / IntrCity AC Sleeper',930,1260,1750]]
 },
 'jaipur|agra':{
  train:[['12196','Ajmer–Agra Fort Intercity',440,265,165,false],['20981','Udaipur–Agra Vande Bharat',660,240,480,true]],
  bus:[['RSRTC Volvo / Zingbus AC',480,280,480]]
 },
 'agra|jaipur':{
  train:[['12195','Agra Fort–Ajmer Intercity',300,265,165,false]],
  bus:[['RSRTC Volvo / Zingbus AC',510,280,480]]
 },
 'mumbai|goa':{
  train:[['22229','CSMT–Madgaon Vande Bharat',325,465,860,true],['12051','Dadar–Madgaon Jan Shatabdi',310,540,260,false]],
  flight:[['6E 5032','IndiGo Non-stop',540,75,3450],['QP 1126','Akasa Air Non-stop',870,75,3290]],
  bus:[['IntrCity SmartBus / Paulo Volvo',1230,735,1180]]
 },
 'goa|mumbai':{
  train:[['22230','Madgaon–CSMT Vande Bharat',880,465,860,true],['12052','Madgaon–Dadar Jan Shatabdi',880,545,260,false]],
  flight:[['6E 5033','IndiGo Non-stop',650,75,3490],['QP 1127','Akasa Air Non-stop',980,75,3320]],
  bus:[['IntrCity SmartBus / Paulo Volvo',1200,740,1180]]
 },
 'kolkata|bengaluru':{
  train:[['12863','Howrah–SMVT Bengaluru SF Exp',1235,2050,765,false],['12245','Howrah–SMVT Duronto Express',650,1750,890,false]],
  flight:[['6E 6214','IndiGo Non-stop',480,160,5750],['IX 2714','Air India Express',945,165,5490]]
 },
 'bengaluru|kolkata':{
  train:[['12864','SMVT Bengaluru–Howrah SF Exp',635,2065,765,false],['12246','SMVT–Howrah Duronto Express',660,1760,890,false]],
  flight:[['6E 6215','IndiGo Non-stop',510,155,5690],['IX 2715','Air India Express',960,160,5450]]
 },
 'chennai|bengaluru':{
  train:[['20607','Chennai–Mysuru Vande Bharat',350,265,610,true],['12007','Chennai–Mysuru Shatabdi',360,290,560,true]],
  flight:[['6E 6421','IndiGo Non-stop',470,60,2890]],
  bus:[['KSRTC Airavat / NueGo Electric',420,375,690]]
 },
 'bengaluru|chennai':{
  train:[['20608','Mysuru–Chennai Vande Bharat',900,265,610,true],['12008','Mysuru–Chennai Shatabdi',975,295,560,true]],
  flight:[['6E 6422','IndiGo Non-stop',560,60,2950]],
  bus:[['KSRTC Airavat / NueGo Electric',450,370,690]]
 },
 'delhi|manali':{
  bus:[['HRTC Himsuta Volvo / Zingbus Maxx',1200,735,1290]]
 },
 'manali|delhi':{
  bus:[['HRTC Himsuta Volvo / Zingbus Maxx',1140,750,1290]]
 },
 'delhi|lucknow':{
  train:[['82502','IRCTC Tejas Express',930,385,780,true],['12004','Lucknow Swarna Shatabdi',370,400,690,true]],
  flight:[['6E 2107','IndiGo Non-stop',480,75,3550],['AI 411','Air India Non-stop',820,80,3950]],
  bus:[['UPSRTC Janrath / Zingbus Volvo',1320,495,880]]
 },
 'lucknow|delhi':{
  train:[['82501','IRCTC Tejas Express',370,385,780,true],['12003','New Delhi Swarna Shatabdi',935,405,690,true]],
  flight:[['6E 2108','IndiGo Non-stop',590,75,3500],['AI 412','Air India Non-stop',930,80,3900]],
  bus:[['UPSRTC Janrath / Zingbus Volvo',1320,500,880]]
 },
 'delhi|varanasi':{
  train:[['22436','New Delhi–Varanasi Vande Bharat',360,480,980,true],['12560','Shiv Ganga SF Express',1205,605,435,false]],
  flight:[['6E 2211','IndiGo Non-stop',510,90,4150],['AI 406','Air India Non-stop',795,95,4550]],
  bus:[['IntrCity SmartBus Volvo AC',1140,810,1250]]
 },
 'varanasi|delhi':{
  train:[['22435','Varanasi–New Delhi Vande Bharat',900,480,980,true],['12559','Shiv Ganga SF Express',1335,610,435,false]],
  flight:[['6E 2212','IndiGo Non-stop',630,95,4200],['AI 405','Air India Non-stop',920,95,4600]],
  bus:[['IntrCity SmartBus Volvo AC',1140,820,1250]]
 },
 'mumbai|pune':{
  train:[['12123','Deccan Queen SF Express',1030,195,145,false],['22225','CSMT–Solapur Vande Bharat',965,175,390,true]],
  bus:[['MSRTC Shivneri / NueGo Electric',480,210,460]]
 },
 'pune|mumbai':{
  train:[['12124','Deccan Queen SF Express',435,195,145,false],['22226','Solapur–CSMT Vande Bharat',605,175,390,true]],
  bus:[['MSRTC Shivneri / NueGo Electric',480,215,460]]
 },
 'hyderabad|bengaluru':{
  train:[['20703','Kacheguda–Yesvantpur Vande Bharat',345,510,880,true],['12785','Kacheguda–SMVT SF Express',1145,680,385,false]],
  flight:[['6E 682','IndiGo Non-stop',460,75,3350],['QP 1352','Akasa Air Non-stop',890,75,3190]],
  bus:[['KSRTC Ambari / IntrCity Volvo',1320,570,1050]]
 },
 'bengaluru|hyderabad':{
  train:[['20704','Yesvantpur–Kacheguda Vande Bharat',885,510,880,true],['12786','SMVT–Kacheguda SF Express',1095,685,385,false]],
  flight:[['6E 683','IndiGo Non-stop',570,75,3390],['QP 1353','Akasa Air Non-stop',990,75,3250]],
  bus:[['KSRTC Ambari / IntrCity Volvo',1320,575,1050]]
 },
 'delhi|kolkata':{
  train:[['12302','New Delhi–Howrah Rajdhani Exp',1010,1025,1120,true],['12314','Sealdah Rajdhani Express',990,1060,1110,true]],
  flight:[['6E 2034','IndiGo Non-stop',495,135,5450],['AI 762','Air India Non-stop',870,140,5950]]
 },
 'kolkata|delhi':{
  train:[['12301','Howrah–New Delhi Rajdhani Exp',1010,1035,1120,true],['12313','Sealdah–New Delhi Rajdhani',1010,1060,1110,true]],
  flight:[['6E 2035','IndiGo Non-stop',510,140,5490],['AI 761','Air India Non-stop',885,145,5990]]
 },
 'delhi|srinagar':{
  flight:[['6E 2134','IndiGo Non-stop',495,90,4850],['AI 825','Air India Non-stop',650,95,5350]]
 },
 'srinagar|delhi':{
  flight:[['6E 2135','IndiGo Non-stop',620,95,4900],['AI 826','Air India Non-stop',780,95,5400]]
 },
 'delhi|ahmedabad':{
  train:[['12958','Swarna Jayanti Rajdhani Exp',1195,825,840,true],['12916','Ashram Superfast Express',920,900,485,false]],
  flight:[['6E 2046','IndiGo Non-stop',460,95,4150],['QP 1422','Akasa Air Non-stop',840,95,3990]],
  bus:[['Shrinath / IntrCity AC Sleeper',1140,1020,1520]]
 },
 'mumbai|ahmedabad':{
  train:[['20901','Mumbai–Gandhinagar Vande Bharat',360,325,740,true],['12009','Mumbai–Ahmedabad Shatabdi',380,380,680,true]],
  flight:[['6E 5106','IndiGo Non-stop',450,75,3250]],
  bus:[['GSRTC Volvo / Zingbus AC',1320,570,920]]
 }
};
