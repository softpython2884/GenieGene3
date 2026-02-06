let oBank={enablePRO:true,enableARN:true,enableADN:true,tEnable:['ADN','ARN','PRO']};

oBank.init = function () {
	oBank.tSel=[];
	oBank.motsCles=[];
	let script=document.createElement('script');
	script.setAttribute("type","text/javascript");
	script.setAttribute("src", "banque/banqueSequences.js?"+ new Date().getTime());
	document.head.appendChild(script);
}

oBank.init2 = function () {
	for (let s of oBank.tSeq) {
		if (typeof(s.motsCles)=="undefined") {s.motsCles=""}
		let tType=s.type.split(",");
		s.type=tType[0];
		if (tType.length>1) {
			s.type2=tType[1];
		} else {
			s.type2="";
		}
		let typeLong=s.type;
		if ((s.type=="ADN")&&(s.type2=="C")) {typeLong+="(cod)"}
		else if ((s.type=="ARN")&&(s.type2=="C")) {typeLong+="m(cod)"}
		else if ((s.type=="ARN")&&(s.type2=="M")) {typeLong+="m"}
		else if ((s.type=="ARN")&&(s.type2=="PM")) {typeLong+="pm"}
		s.typeLong=typeLong;
		
		// on extrait mots clÃ©s
		let txt=s.titre+","+s.titreLong;
		if (typeof(s.motsCles)!="undefined") {
			txt+=","+s.motsCles;
		}
		if (typeof(s.org)!="undefined") {
			txt+=","+s.org;
		}
		if (typeof(s.gene)!="undefined") {
			txt+=","+s.gene;
		}
		if (typeof(s.allele)!="undefined") {
			txt+=","+s.allele;
		}
		if (typeof(s.gene)!="undefined") {
			txt+=","+s.gene;
		}
		if (typeof(s.allele)!="undefined") {
			txt+=","+s.allele;
		}
		if (s.pdb) {
			s.pdb.local=s.pdb.local||false;
			txt+=",pdb";
			txt+=","+s.pdb;
		}
		txt=txt.toLowerCase();
		txt=txt.trim();
		txt=txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		txt=txt.replace(/ /g,",");
		txt=txt.replace(/;/g,",");
		txt=txt.replace(/'/g,",");
		let tMotsCles=txt.split(",");		
		tMotsCles=tMotsCles.filter(c=>(c.length>1));
		tMotsCles=removeDoublonsTableau(tMotsCles);
		s.tMotsCles=tMotsCles;
	}
	oBank.checkDoublons();
	oDem.start2();
}

oBank.checkDoublons = function () {
	for (let s of oBank.tSeq) {
		let f=oBank.tSeq.filter(c=>c.id==s.id);
		if (f.length>1) {console.log ("Doublon dans la banque : "+s.id)}
	}
}
oBank.openPanel = function () {
	show(divPanneauBanque);
	inputMotsCles.value="";
	oBank.motsCles=[];
	inputMotsCles.focus();
	oBank.refreshListe();
	oBank.refreshCheck();
}

oBank.refreshCheck = function () {
	checkDCB("checkBankPRO",oBank.enablePRO);
	checkDCB("checkBankADN",oBank.enableADN);
	checkDCB("checkBankARN",oBank.enableARN);
	oBank.tEnable=[];
	if (oBank.enableADN) {oBank.tEnable.push("ADN")}
	if (oBank.enableARN) {oBank.tEnable.push("ARN")}
	if (oBank.enablePRO) {oBank.tEnable.push("PRO")}
}

oBank.togglePRO=function () {
	oBank.enablePRO=!oBank.enablePRO;
	oBank.refreshCheck ();
	oBank.refreshListe();
}

oBank.toggleADN=function () {
	oBank.enableADN=!oBank.enableADN;
	oBank.refreshCheck ();
	oBank.refreshListe();
}

oBank.toggleARN=function () {
	oBank.enableARN=!oBank.enableARN;
	oBank.refreshCheck ();
	oBank.refreshListe();
}

oBank.typeEnabled=function (type) {
	return oBank.tEnable.some(c=>c==type);
}

oBank.typeEnabledPack=function (tSeq2) {
	let tType=[];
	for (let s of tSeq2) {
		tType.push(oBank.tSeq.find(c=>c.id==s).type);
	}
	return tType.some(c=>(oBank.tEnable.includes (c)));
}

oBank.typeEnabledExt=function (tSeq2) {
	let tType=[];
	for (let s of tSeq2) {
		let types=oBank.tSeq.find(c=>c.id==s).types;
		for (let t of types) {
			tType.push(t);
		}
	}
	return tType.some(c=>(oBank.tEnable.includes (c)));
}

oBank.typeEnabledTypes =function (types) {
	return types.some(c=>(oBank.tEnable.includes (c)));
}

oBank.contientMotCle = function (seq) {
	if (oBank.motsCles.length==0) {return true}
	let contient=false;
	for (let t of seq.tMotsCles) {
		for (let m of oBank.motsCles) {
			if (t.indexOf(m)>=0) {
				contient=true;
				break;
			}
		}
	}
	return contient;
}

oBank.scoreMotsCles = function (seq) {
	if (oBank.motsCles.length==0) {return 0}
	let n=0;
	for (let m of oBank.motsCles) {
		if (seq.tMotsCles.some(c=>c.includes(m))) {
			n++;
		}
	}
	return n;
}

oBank.saisieMots = function () {
	let v=inputMotsCles.value;
	v=v.toLowerCase();
	v=v.trim();
	v=v.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	v=v.replace(/ /g,",");
	v=v.replace(/;/g,",");
	v=v.replace(/'/g,",");
	let newMotCles=v.split(",");
	newMotCles=newMotCles.filter(c=>c.length>=2);
	if (JSON.stringify(newMotCles)!=JSON.stringify(oBank.motsCles)) {
		// le tableau a vraiment changÃ©
		oBank.motsCles=JSON.parse(JSON.stringify(newMotCles));
	}
	oBank.refreshListe();
}

oBank.creeLien = function () {
	let txt="<p>Lien direct vers ces sÃ©quences : </p>";
	txt+="<p>(Ã  copier/coller avec un clic droit)</p>";
	let url="https://www.pedagogie.ac-nice.fr/svt/productions/geniegen2/?load=";
	if (oDem.domaine=="cosphilog") {
		 url="https://cosphilog.fr/geniegen2/?load=";
	}
	for (let s of oBank.tSel) {
		url+=oBank.tSeq[s].id+",";
	}
	url=url.slice(0, -1);
	txt+="<a href='"+url+"'>"+url+"</a>";
	avert ({titre:"Information",texte:txt});
}

oBank.refreshListe = function () {
	enableMenuSi("divPartager",oBank.tSel.length>0);
	enableMenuSi("divChargerCesSequences",oBank.tSel.length>0);
	let tSeq=oBank.tSeq;
	let txt="";
	
	// PACKS DE SEQUENCES (PAC)
	let txt1="";
	let tScore=[];
	let dejaEnTete=false;
	// on cherche des numÃ©ros de packs contenant les mots clÃ©s
	for (let i=0;i<tSeq.length;i++) {
		let seq=tSeq[i];
		if (seq.type=="PACK") {
			if (oBank.typeEnabledPack(seq.tSeq2)) {
				let score=1;
				if (oBank.motsCles.length>0) {
					let score1=oBank.scoreMotsCles(seq);
					// on ajoute le score des seq individuelles assocÃ©es
					let score2=0;
					for (let sid of seq.tSeq2) {
						let seq2=tSeq.find(c=>c.id==sid);
						score2+=oBank.scoreMotsCles(seq2);
					}
					score2=score2/seq.tSeq2.length; // elles comptent moins lourd
					score=score1+score2;
				}
				if (score>0) {
					tScore.push({i:i,score:score});
				}
			}
		}
	}
	// on les range par score dÃ©croissant
	tScore=tScore.sort((a,b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0)); 
	// on rajoute Ã  txt1;
	for (let s of tScore) {
		let i=s.i;
		let seq=tSeq[i];
		let id=seq.id;
		txt1+="<tr "
		if (oBank.tSel.indexOf(i)>=0) {
			txt1+="class='menuDisabled'";
		}
		txt1+=">";
		txt1+="<td style='cursor:pointer' onclick='oBank.addToSel("+i+")'>";
		txt1+="<div class='addIcon'></div> "+seq.titreLong;
		txt1+="</td>";
		txt1+="</tr>"
	}
	txt1+="</table>";
	if (tScore.length>0) {
		dejaEnTete=true;
		txt+="<p><b><i>Packs de sÃ©quences</i></b><br>";
		txt+="<div class='addIcon'></div> <i>Cliquez sur le nom d'un pack pour le rajouter Ã  la sÃ©lection</i></p>";
		txt+="<table class='tableSeq'>";
		txt+="<tr style='background-color:#EEE'>";
		txt+="<td><b>Nom du pack</b></td>";
		txt+="</tr>";
		txt+=txt1;
	}
	
	// PACKS EDI ISOLES
	txt1="";
	tScore=[];
	// on cherche des numÃ©ros de packs contenant les mots clÃ©s
	for (let i=0;i<tSeq.length;i++) {
		let seq=tSeq[i];
		if (seq.type=="EDI") {
			if (oBank.typeEnabledTypes(seq.types)) {
				let score=1;
				if (oBank.motsCles.length>0) {
					score=oBank.scoreMotsCles(seq);
					// on ajoute le score des seq individuelles assocÃ©es
				}
				if (score>0) {
					tScore.push({i:i,score:score});
				}
			}
		}
	}
	// on les range par score dÃ©croissant
	tScore=tScore.sort((a,b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0)); 
	// on rajoute Ã  txt1;
	for (let s of tScore) {
		let i=s.i;
		let seq=tSeq[i];
		let id=seq.id;
		txt1+="<tr "
		if (oBank.tSel.indexOf(i)>=0) {
			txt1+="class='menuDisabled'";
		}
		txt1+=">";
		txt1+="<td style='cursor:pointer' onclick='oBank.addToSel("+i+")'>";
		txt1+="<div class='addIcon'></div> "+seq.titreLong;
		txt1+="</td>";
		txt1+="</tr>"
	}
	txt1+="</table>";
	if (tScore.length>0) {
		if (!dejaEnTete) {
			txt+="<p><b><i>Packs de sÃ©quences</i></b><br>";
			txt+="<div class='addIcon'></div> <i>Cliquez sur le nom d'un pack pour le rajouter Ã  la sÃ©lection</i></p>";
			txt+="<table class='tableSeq'>";
			txt+="<tr style='background-color:#EEE'>";
			txt+="<td><b>Nom du pack</b></td>";
			txt+="</tr>";
		} else {
			txt+="<table class='tableSeq'>";
		}
		txt+=txt1;
	}
	
	
	// DOSSIERS EXT
	let txt2="";
	let dossierTrouve=false;
	for (let i=0;i<tSeq.length;i++) {
		let seq=tSeq[i];
		if (seq.type=="DOSEXT") {
			if (oBank.typeEnabledExt(seq.tSeq2)) {
				let contientMotCle=oBank.contientMotCle(seq);
				if (!contientMotCle) { // on vÃ©rifie dans les sÃ©quences du dossier
					for (let id3 of seq.tSeq2) {
						let i3=oBank.tSeq.findIndex(c=>c.id==id3);
						let seq3=oBank.tSeq[i3];
						if (oBank.contientMotCle(seq3)) {
							contientMotCle=true;
							break;
						}
					}
				}
				if (contientMotCle) {
					dossierTrouve=true;
					let id=seq.id;
					txt2+="<tr style='background-color:#F5F5F5'>"
					txt2+="<td style='max-width:10em;font-size:0.8em'>"+seq.auteur+"</td>";
					txt2+="<td><b>"+seq.titreLong+"</b></td>";
					let url=seq.url;
					if (url.length>34) {url=url.substr(0,20)+"..."+url.substr(-10)}
					txt2+="<td style='font-size:0.8em'><a href='"+seq.url+"' target='_blank'>"+url+"</a></td>";
					txt2+="</tr>"
					for (let id3 of seq.tSeq2) {
						let i3=oBank.tSeq.findIndex(c=>c.id==id3);
						let seq3=oBank.tSeq[i3];
						if (oBank.typeEnabledTypes(seq3.types)) {
							txt2+="<tr "
							if (oBank.tSel.indexOf(i3)>=0) { // dÃ©jÃ  sel
								txt2+="class='menuDisabled'";
							}
							txt2+=">";
							txt2+="<td></td>";
							txt2+="<td style='cursor:pointer;font-size:0.8em' onclick='oBank.addToSel("+i3+")'>";
							let fn2=seq3.fn;
							if (fn2.includes(".txt.zip")) {
								fn2=fn2.substr(0,fn2.length-8);
							}
							txt2+="&nbsp;&nbsp;&nbsp;<div class='addIcon'></div> "+seq3.titreLong+" (<span style='text-decoration:underline'>"+fn2+"</span>)";
							txt2+="</td>";
							txt2+="<td></td>";
							txt2+="</tr>"
						}
					}
				}
			}
		}
	}
	txt2+="</table>";
	
	if (dossierTrouve) {
		txt+="<br>";
		txt+="<p><b><i>Dossiers pÃ©dagogiques externes</i></b><br>";
		txt+="<p style='font-size:0.8em'><i>Le tableau ci-dessous contient des liens vers des <u>dossiers pÃ©dagogiques</u> et packs de sÃ©quences extÃ©rieurs au projet Geniegen2."
		txt+="</i></p>";
		txt+="<div class='addIcon'></div> <i>Cliquez sur le nom des sÃ©quences pour les rajouter</i><br>";
		txt+="<i>Cliquez sur l'URL de la page d'un dossier pour la consulter.</i></p>";
		txt+="<table class='tableSeq'>";
		txt+="<tr style='background-color:#EEE'>";
		txt+="<td style='width:10em'><b>Auteur</b></td>";
		txt+="<td><b>Nom du dossier / fichiers associÃ©s</b></td>";
		txt+="<td><b>URL du dossier</b></td>";
		txt+="</tr>";
		txt+=txt2;
	}
	
	// SEQUENCES INDIVIDUELLES
	let txt3="";
	
	tScore=[];
	// on cherche des numÃ©ros de sÃ©quences contenant les mots clÃ©s
	for (let i=0;i<tSeq.length;i++) {
		let seq=tSeq[i];
		if ((seq.type=="ADN")||(seq.type=="ARN")||(seq.type=="PRO")) {
			if (oBank.typeEnabled(seq.type)) {
				let score=1;
				if (oBank.motsCles.length>0) {
					score=oBank.scoreMotsCles(seq);
					// on ajoute le score des seq individuelles assocÃ©es
				}
				if (score>0) {
					tScore.push({i:i,score:score});
				}
			}
		}
	}
	
	// on les range par score dÃ©croissant
	tScore=tScore.sort((a,b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0)); 
		
	// on rajoute Ã  txt3;
	for (let s of tScore) {
		let i=s.i;
		let seq=tSeq[i];
		let id=seq.id;
		txt3+="<tr "
		if (oBank.tSel.indexOf(i)>=0) {
			txt3+="class='menuDisabled'";
		}
		txt3+=">";
		txt3+="<td ";
		if (seq.type=="ADN") {txt3+="style='color:green'>"}
		else if (seq.type=="ARN") {txt3+="style='color:red'>"}
		else if (seq.type=="PRO") {txt3+="style='color:blue'>"}
		txt3+=seq.typeLong;
		if (typeof(seq.pdb)!="undefined") {
			txt3+=" [pdb]";
		}
		txt3+="</td>";
		txt3+="<td style='cursor:pointer' onclick='oBank.addToSel("+i+")'>";
		txt3+="<div class='addIcon'></div> "+seq.titreLong;
		txt3+="</td>";
		txt3+="<td>";
		txt3+="<i>"+seq.org+"</i>";
		txt3+="</td>";
		txt3+="</tr>"
	}
	txt3+="</table>";	
	
		
	if (tScore.length>0) {
		txt+="<br>";
		txt+="<p><b><i>SÃ©quences individuelles</i></b><br>";
		if (oBank.typeEnabled("ADN")) {
			txt+="<small><i>Sauf indication contraire, les sÃ©quences d'ADN correspondent au brin non transcrit.</i></small>";
		}
		txt+="<div class='addIcon'></div> <i>Cliquez sur le nom des sÃ©quences pour les rajouter</i></p>";
		txt+="<table class='tableSeq'>";
		txt+="<tr style='background-color:#EEE'>";
		txt+="<td style='width:5em'>Type</td><td><b>SÃ©quence</b></td><td><b>Organisme</b></td>";
		txt+="</tr>";
		txt+=txt3;
	}
	
	txt+="<br>";
	
	divBanqueListeSequencesTxt.innerHTML=txt;
	
	txt="";
	txt+="<table class='tableSeq'>";
	txt+="<tr style='background-color:#EEE'>";
	txt+="<td><b>Type</b></td><td><b>Nom pack ou sÃ©quence (organisme)</b></td>";
	txt+="</tr>";
	let tSel=oBank.tSel;
	for (let i=0;i<tSel.length;i++) {
		let seq=tSeq[tSel[i]];
		txt+="<tr>";
		txt+="<td ";
		if (seq.type=="ADN") {txt+="style='color:green'>"}
			else if (seq.type=="ARN") {txt+="style='color:red'>"}
			else if (seq.type=="PRO") {txt+="style='color:blue'>"}
			else if (seq.type=="PACK") {txt+="style='color:black'>"}
			else if (seq.type=="EXT") {txt+="style='color:black'>"}
			else if (seq.type=="EDI") {txt+="style='color:black'>"}
		txt+=seq.typeLong;
		txt+="</td>";
		txt+="<td style='cursor:pointer' onclick='oBank.removeSel(\""+i+"\")' style='cursor:pointer'>";
		txt+="<div class='removeIcon'></div> "+seq.titreLong;
		if (typeof(seq.org)!="undefined") {
			if (seq.org!="") {
				txt+=" (<i>"+seq.org+"</i>)";
			}
		}
		txt+="</td>";
		txt+="</tr>"
	}
	txt+="</table>";
	divBanqueListePanierTxt.innerHTML=txt;
}

oBank.cancel = function () {
	hide(divPanneauBanque);
}

oBank.loadSelectionDem = function () {
	let tSel=oDem.load.split(",");
	let err=false;
	oBank.tSel=[];
	for (let sid of tSel) {
		let id=oBank.tSeq.findIndex(c=>c.id==sid);
		if (id>=0) {
			oBank.tSel.push(id);
		} else {
			err=true;
		}
	}
	if (oBank.tSel.length==0) {
		if (oDem.load!="") {avert({titre:"Erreur",texte:"Aucune sÃ©quence n'a pu Ãªtre chargÃ©e.<br><br>VÃ©rifiez que l'URL utilisÃ©e n'est pas corrompue ou incomplÃ¨te."});}
		else {avert({titre:"Erreur",texte:"Aucune sÃ©quence n'a pu Ãªtre chargÃ©e."});}
		oFile.allFilesLoaded();
		return false;
	} 
	if (err) {
		avert({titre:"Erreur",texte:"Au moins une sÃ©quence n'a pas pu Ãªtre chargÃ©e.<br><br>VÃ©rifiez que l'URL utilisÃ©e n'est pas corrompue ou incomplÃ¨te."});
	}
	oBank.loadSelection();
}

oBank.loadSelection = function () {
	showWait();
	// on ajoute les sÃ©quences correspondantes aux packs
	for (let s of oBank.tSel) {
		let seq=oBank.tSeq[s];
		if (seq.type=="PACK") {
			let tS2=seq.tSeq2;
			for (let s2 of tS2) {
				let i=oBank.tSeq.findIndex(c=>c.id==s2);
				oBank.tSel.push(i);
			}
		} else if (seq.type=="DOSEXT") {
			let tS2=seq.tSeq2;
			for (let s2 of tS2) {
				let i=oBank.tSeq.findIndex(c=>c.id==s2);
				oBank.tSel.push(i);
			}
		}
	}
	
	// on retire les packs
	let newSel=oBank.tSel.filter(c=>oBank.tSeq[c].type!="PACK");
	oBank.tSel=JSON.parse(JSON.stringify(newSel));
	
	oBank.loadN=-1;
	setTimeout(oBank.loadNextFile,50);
}

oBank.loadNextFile = function () {
	oBank.loadN++;
	if (oBank.loadN>=oBank.tSel.length) {
		oFile.allFilesLoaded();
		return false;
	}
	let sel=oBank.tSeq[oBank.tSel[oBank.loadN]];
	if ((sel.type=="EXT")||(sel.type=="EDI")) {
		oBank.loadSequenceExt(sel.fn);
	} else {
		oBank.loadSequence(sel.id,sel.fn,sel.titre,sel.type,sel.pdb);
	}
}



oBank.loadSequenceExt = function (fn) {
	// SÃ©quences externes, ATTENTION ANSI
	debug ("Chargement du fichier : "+fn);
	if (fn.substr(fn.length-3)=="zip") {
		// zip
		let oReq = new XMLHttpRequest();
		oReq.open("GET", "banque/ext/"+fn, true);
		oReq.responseType = "arraybuffer";
		
		oReq.onload = function (oEvent) {
			let arrayBuffer = oReq.response; 
			if (arrayBuffer) {
				JSZip.loadAsync(arrayBuffer).then(function (zip) {
					zip.forEach(function (relativePath, zipEntry) {
						let fn=zipEntry.name;
						zip.files[fn].async('uint8array').then (function (uint8array) {
							// on charge en binaire on convertit de ANSI vers UTF-8
							let txt = new TextDecoder("windows-1252").decode(uint8array);
							oFile.extraitFromTxtEdi(txt);
							oBank.loadNextFile();
						})
					});
				});
			}
		}
		oReq.send(null);	
	} else {
		// pas zip
		let rawFile = new XMLHttpRequest();
		rawFile.open("GET", "banque/ext/"+fn+".txt", true);
		rawFile.overrideMimeType('text/xml; charset=iso-8859-1'); // ANSI
		rawFile.onreadystatechange = function ()
		{
			if(rawFile.readyState === 4)
			{
				if(rawFile.status === 200 || rawFile.status == 0)
				{
					let txt = rawFile.responseText;
					oFile.extraitFromTxtEdi(txt);
					oBank.loadNextFile();
				} else {
					console.log ("Impossible de charger "+fn);
					oBank.loadNextFile();
				}
			}
		}
		rawFile.send(null);
	}
}


oBank.loadSequenceZip = function (id,fn,titre,type,pdb) {
	let oReq = new XMLHttpRequest();
	oReq.open("GET", "banque/"+fn, true);
	oReq.responseType = "arraybuffer";
	
	oReq.onload = function (oEvent) {
		let arrayBuffer = oReq.response; 
		if (arrayBuffer) {
			JSZip.loadAsync(arrayBuffer).then(function (zip) {
				zip.forEach(function (relativePath, zipEntry) {
					let fn=zipEntry.name;
					zip.files[fn].async('string').then (function (txt) {
						oBank.loadSequence2(id,txt,titre,type,pdb)
					})
				});
			});
		}
	}
	oReq.send(null);	
}


oBank.loadSequence =function (id,fn,titre,type,pdb) {
	// chargement d'une sÃ©quence simple de la banque
	debug ("Chargement de "+titre+","+fn+","+type);
	if (fn.substr(fn.length-3)=="zip") {
		// zip
		oBank.loadSequenceZip(id,fn,titre,type,pdb);
	} else {
		// pas zip
		let rawFile = new XMLHttpRequest();
		rawFile.open("GET", "banque/"+fn, true);
		rawFile.onreadystatechange = function () {
			if(rawFile.readyState === 4) {
				if(rawFile.status === 200 || rawFile.status == 0) {
					let txt = rawFile.responseText;
					oBank.loadSequence2 (id,txt,titre,type,pdb);
					
				} else {
					console.log ("Impossible de charger "+fn);
					oBank.loadNextFile();
				}
			}
		}
		rawFile.send(null);
	}
}

oBank.loadSequence2 =function (id,txt,titre,type,pdb) {
	txt=txt.toUpperCase();
	let tTxt=txt.split("\n");
	tTxt=tTxt.filter(c=>c[0]!=">"); // on supprime les lignes commenÃ§ant par ">"
	txt=tTxt.join("");
	txt=txt.replace(/[^\x2C-\x5FÎ¨]+/g, ''); // on ne garde que les caractÃ¨res ASCII visibles sans oublier Î¨ jusqu'Ã  _, on vire les espaces au passage (20)
	txt=oSeq.nettoieSeq(txt,type);
	titre=titre.trim();
	titre=titre.substring(0,oSeq.nbMaxCarTitre-4);
	oSeqNa.tSeq.push({id:id,titre:titre,type:type,dec:0,seq:txt,pdb:pdb,sel:true,time:Date.now()+(oFile.incr++)});
	oSeq.makeTitresUniques(oSeqNa.tSeq);
	oBank.loadNextFile();
}


oBank.addToSel = function (ii) {
	oBank.tSel.push(ii);	
	oBank.refreshListe ();
}

oBank.removeSel = function (ii) {
	oBank.tSel.splice(ii,1);
	oBank.refreshListe ();	
}