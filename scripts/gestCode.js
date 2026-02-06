oCode={tableauVisible:false,abrevVisible:false,iDalto:0};

oCode.tAa=[["Alanine","Ala","A"],
["Arginine","Arg","R"],
["Acide aspartique","Asp","D"],
["Asparagine","Asn","N"],
["CystÃ©ine","Cys","C"],
["Acide glutamique","Glu","E"],
["Glutamine","Gln","Q"],
["Glycine","Gly","G"],
["Histidine","His","H"],
["Isoleucine","Ile","I"],
["Leucine","Leu","L"],
["Lysine","Lys","K"],
["MÃ©thionine","Met","M"],
["PhÃ©nylalanine","Phe","F"],
["Proline","Pro","P"],
["Serine","Ser","S"],
["ThrÃ©onine","Thr","T"],
["Tryptophane","Trp","W"],
["Tyrosine","Tyr","Y"],
["Valine","Val","V"],
["Inconnu","XXX","X"],
["","_","_"],
["","-","-"]
];


// #0077BB #33BBEE #009988 #EE7733 #CC3311 #EE3377 #BBBBBB
// #60aad5 #80d5f4 #60c0b5 #f4aa80 #df806b #f480aa #dcdcdc
// https://personal.sron.nl/~pault/

oCode.coulAA = {
  'A': [["#efe5ef"],["#dcdcdc"]], //ALA
  'R': [["#AADDFF"],["#60aad5"]], //ARG
  'N': [["#DFCFFF"],["#60c0b5"]], //ASN
  'D': [["#FFC7C7"],["#f4aa80"]], //ASP
  'C': [["#f7f7b7"],["#df806b"]], //CYS
  'Q': [["#EECCEE"],["#60c0b5"]], //GLN
  'E': [["#ffD7D7"],["#f4aa80"]], //GLU
  'G': [["#e7e7e7"],["#dcdcdc"]], //GLY
  'H': [["#BBDDFF"],["#60aad5"]], //HIS
  'I': [["#ddeeee"],["#dcdcdc"]], //ILE
  'L': [["#ddeedd"],["#dcdcdc"]], //LEU
  'K': [["#AAEEEE"],["#60aad5"]], //LYS
  'M': [["#e7e7d7"],["#dcdcdc"]], //MET
  'F': [["#FFDD88"],["#f480aa"]], //PHE
  'P': [["#eeff99"],["#df806b"]], //PRO
  'S': [["#CCFF77"],["#80d5f4"]], //SER
  'T': [["#CCFF99"],["#80d5f4"]], //THR
  'W': [["#FFE577"],["#f480aa"]], //TRP
  'Y': [["#FFE8AA"],["#f480aa"]], //TYR
  'V': [["#eaf0e0"],["#dcdcdc"]],  //VAL
  '_': [["#ffffff"],["#ffffff"]],  
  '-': [["#ffffff"],["#ffffff"]], 
  'X': [["#ffffff"],["#ffffff"]]
}

oCode.coulNucl = {
	'A': [["#FFE4E4"],["#FF7777"]], 
	'C': [["#BBFFBB"],["#44CC44"]], 
	'G': [["#F9F9AA"],["#FFFF00"]], 
	'T': [["#DDEEFF"],["#5599FF"]], 
	'U': [["#DDEEFF"],["#5599FF"]],
	'Î¨': [["#DDEEFF"],["#5599FF"]],
	'_': [["#ffffff"],["#ffffff"]],  
	'-': [["#ffffff"],["#ffffff"]], 
	'X': [["#ffffff"],["#ffffff"]], 
	'N': [["#ffffff"],["#ffffff"]] 
}

oCode.getCol = function (res,type) {
	if (type=="PRO") {
		let c=oCode.coulAA[res];
		if (typeof(c)!="undefined") {
			let coul=c[oCode.iDalto];
			return coul;
		} 
	}
	if ((type=="ADN")||(type=="ARN")) {
		let c=oCode.coulNucl[res];
		if (typeof(c)!="undefined") {
			let coul=c[oCode.iDalto];
			return coul;
		} 
	} 
	return ["#FFFFFF"];
}

oCode.genereDico = function () {
	let ln=["A","T","C","G"];
	for (let i=0;i<4;i++) {
		for (let j=0;j<4;j++) {
			for (let k=0;k<4;k++) {
				let codon=ln[i]+ln[j]+ln[k];
				let aa=Object.keys(oCode.dico).filter(x => oCode.dico[x].includes(codon))
				console.log ('"'+codon+'":"'+aa+'",');
			}
		}
	}
}

oCode.dico = { 
 "A": ["GCA","GCC","GCG","GCT"], 
 "C": ["TGC","TGT"], 
 "D": ["GAC", "GAT"],
 "E": ["GAA","GAG"],
 "F": ["TTC","TTT"],
 "G": ["GGA","GGC","GGG","GGT"],
 "H": ["CAC","CAT"],
 "I": ["ATA","ATC","ATT"],
 "K": ["AAA","AAG"],
 "L": ["CTA","CTC","CTG","CTT","TTA","TTG"],
 "M": ["ATG"],
 "N": ["AAC","AAT"],
 "P": ["CCA","CCC","CCG","CCT"],
 "Q": ["CAA","CAG"],
 "R": ["AGA","AGG","CGA","CGC","CGG","CGT"],
 "S": ["AGC","AGT","TCA","TCC","TCG","TCT"],
 "T": ["ACA","ACC","ACG","ACT"],
 "V": ["GTA","GTC","GTG","GTT"],
 "W": ["TGG"],
 "Y": ["TAC","TAT"],
 "!": ["TAG","TGA","TAA"]
};

oCode.dico2 = {
	"AAA":"K",
	"AAT":"N",
	"AAC":"N",
	"AAG":"K",
	"ATA":"I",
	"ATT":"I",
	"ATC":"I",
	"ATG":"M",
	"ACA":"T",
	"ACT":"T",
	"ACC":"T",
	"ACG":"T",
	"AGA":"R",
	"AGT":"S",
	"AGC":"S",
	"AGG":"R",
	"TAA":"!",
	"TAT":"Y",
	"TAC":"Y",
	"TAG":"!",
	"TTA":"L",
	"TTT":"F",
	"TTC":"F",
	"TTG":"L",
	"TCA":"S",
	"TCT":"S",
	"TCC":"S",
	"TCG":"S",
	"TGA":"!",
	"TGT":"C",
	"TGC":"C",
	"TGG":"W",
	"CAA":"Q",
	"CAT":"H",
	"CAC":"H",
	"CAG":"Q",
	"CTA":"L",
	"CTT":"L",
	"CTC":"L",
	"CTG":"L",
	"CCA":"P",
	"CCT":"P",
	"CCC":"P",
	"CCG":"P",
	"CGA":"R",
	"CGT":"R",
	"CGC":"R",
	"CGG":"R",
	"GAA":"E",
	"GAT":"D",
	"GAC":"D",
	"GAG":"E",
	"GTA":"V",
	"GTT":"V",
	"GTC":"V",
	"GTG":"V",
	"GCA":"A",
	"GCT":"A",
	"GCC":"A",
	"GCG":"A",
	"GGA":"G",
	"GGT":"G",
	"GGC":"G",
	"GGG":"G"
}

oCode.toggleDalto = function () {
	oCode.iDalto=1-oCode.iDalto;
	oDist.buildSpectre ();
	oDist.recalcMatchCol (oSeqNa);
	oDist.recalcMatchCol (oSeqAl);
	oDist.recalcMatchCol (oSeqEnz);
	oSeq.afficheToutesSequences(true);
	if (oProt.molecReady) {
		oProt.updateCol();
	}
	oMenu.update();
}

oCode.traduitEtAjoute = function (s,mode) {
	let seq=s.seq;
	seq=seq.replace(/Î¨/g,"U"); // pseudouridines => U
	let decPremierCodon=0;
	if (mode=="premier") {
		let codStart="ATG";
		if (s.type=="ARN") {
			codStart="AUG";
		}
		let posStart=seq.indexOf(codStart);
		if (posStart<0) {
			seq="";
		} else {
			decPremierCodon=posStart;
			seq=seq.substring(posStart,s.length);
		}
	}
	if (decPremierCodon>0) {
		oSeq.decal=true;
		oMenu.update();
	}
	let seqPro=oCode.traduit (seq,s.dec);
	let newDec=0;
	if ((oSeq.decal)&&(s.dec>0)) {
		newDec=Math.ceil(s.dec/3)*3;
		console.log (newDec);
	}
	// on crÃ©e la sÃ©quence pro correspondant
	let titre=s.titre;
	titre=titre.substring(0,oSeq.nbMaxCarTitre-4-5); // 3 pour PRO 2 espaces
	titre+=" PRO";
	oSeqNa.tSeq.push({titre:titre,type:"PRO",seq:seqPro,sel:false,dec:newDec+decPremierCodon,time:Date.now()+(oFile.incr++)});
}

oCode.traduireSelSeq = function (mode) {
	oMenu.exitMenu();
	for (let s of oSeqNa.tSeq) {
		if (s.sel) {
			if (s.type!="PRO") {
				oCode.traduitEtAjoute(s,mode);
			}
		}
	}
	oSeq.makeTitresUniques(oSeqNa.tSeq);
	oDist.compareSel();
	oSeq.afficheToutesSequences(true);
	oMenu.update();
}

oCode.traduireCtxSeq = function (mode) {
	oMenu.exitMenu();
	let nId=oSeq.ctxNId;
	let s=oSeqNa.tSeq[nId];
	oCode.traduitEtAjoute(s,mode);
	oSeq.makeTitresUniques(oSeqNa.tSeq);
	oDist.compareSel();
	oSeq.afficheToutesSequences(true);
	oMenu.update();
}

oCode.complemente = function (s) {
	let seq=s.seq;
	let seqCompl=oCode.compl (seq,s.type);
	// on crÃ©e la sÃ©quence pro correspondant
	let titre=s.titre;
	titre=titre.substring(0,oSeq.nbMaxCarTitre-4-5); // 3 pour PRO 2 espaces
	titre+=" cpl";
	return {titre:titre,type:s.type,seq:seqCompl,sel:false,dec:s.dec,time:Date.now()+(oFile.incr++)}
}

oCode.creeComplSelSeq = function () {
	showWait();
	oMenu.exitMenu();
	setTimeout(function(){oCode.creeComplSelSeq2 ()},50);
}

oCode.creeComplSelSeq2 = function () {
	hideWait();
	let tTemp=[];
	for (let s of oSeqNa.tSeq) {
		if (s.sel) {
			if (s.type!="PRO") {
				tTemp.push(oCode.complemente(s));
			}
		}
	}
	for (let s of tTemp) {
		oSeqNa.tSeq.push(s);
	}
	oSeq.makeTitresUniques(oSeqNa.tSeq);
	oDist.compareSel();
	oSeq.afficheToutesSequences(true);
	oMenu.update();
	hideWait();
}

oCode.creeComplCtxSeq = function () {
	showWait();
	oMenu.exitMenu();
	setTimeout(function(){oCode.creeComplCtxSeq2 ()},50);
}

oCode.creeComplCtxSeq2 = function () {
	let nId=oSeq.ctxNId;
	let s=oSeqNa.tSeq[nId];
	let sc=oCode.complemente(s);
	
	oSeqNa.tSeq.push(sc);
	oSeq.makeTitresUniques(oSeqNa.tSeq);
	
	oDist.compareSel();
	oSeq.afficheToutesSequences(true);
	oMenu.update();
	hideWait();
}






oCode.trans = function (seq) {
	let sc="";
	for (let i=0;i<seq.length;i++) {
		let c=seq[i];
		if (c=="T") {sc+="U"}
		else {sc+=c}
	}
	return sc;
}

oCode.transcrit = function (s,compl) {
	if (compl) {s=oCode.complemente(s)}
	let seq=s.seq;
	let seqTrans=oCode.trans (seq);
	// on crÃ©e la sÃ©quence arn correspondant
	let titre=s.titre;
	titre=titre.substring(0,oSeq.nbMaxCarTitre-4-5); // 3 pour PRO 2 espaces
	titre+=" ARN";
	return {titre:titre,type:"ARN",seq:seqTrans,sel:false,dec:s.dec,time:Date.now()+(oFile.incr++)}
}

oCode.transcrireSelSeq  = function (compl) {
	oMenu.exitMenu();
	showWait();
	setTimeout(function(){oCode.transcrireSelSeq2 (compl)},50);
}

oCode.transcrireSelSeq2  = function (compl) {
	for (let s of oSeqNa.tSeq) {
		if (s.sel) {
			if (s.type=="ADN") {
				oSeqNa.tSeq.push(oCode.transcrit(s,compl));
			}
		}
	}
	oSeq.makeTitresUniques(oSeqNa.tSeq);
	oDist.compareSel();
	oSeq.afficheToutesSequences(true);
	oMenu.update();
	hideWait();
}

oCode.transcrireCtxSeq = function (compl) {
	oMenu.exitMenu();
	showWait();
	setTimeout(function(){oCode.transcrireCtxSeq2 (compl)},50);
}

oCode.transcrireCtxSeq2 = function (compl) {
	let nId=oSeq.ctxNId;
	let s=oSeqNa.tSeq[nId];
	let sc=oCode.transcrit(s,compl);
	
	oSeqNa.tSeq.push(sc);
	oSeq.makeTitresUniques(oSeqNa.tSeq);

	oDist.compareSel();
	oSeq.afficheToutesSequences(true);
	oMenu.update();
	hideWait();
}


oCode.complNuclADN = function (c) {
	switch (c) {
		case "A":return "T";
		case "U":return "A"
		case "Î¨":return "A"
		case "T":return "A"
		case "C":return "G"
		case "G":return "C"
		case "N":return "N"
		case "Y":return "R"
		case "R":return "Y"
		case "M":return "K"
		case "K":return "M"
		case "S":return "W"
		case "W":return "S"
		case "-":return "-"
		case "_":return "_"
		default:return "X"
	}
}

oCode.compl = function (seq,type) {
	let sc="";
	for (let i=0;i<seq.length;i++) {
		sc+=oCode.complNuclADN(seq[i]);
	}
	return sc;
}

oCode.traduit = function (seq,dec) {
	seq=seq.replace(/X/g,"A"); // on remplace tous les X par des A
	seq=seq.replace(/U/g,"T"); // et bien sÃ»r les U par des T
	seq=seq.replace(/Î¨/g,"T"); // sans oublier les pseudouridines
	// dÃ©calage
	if (oSeq.decal) {
		if (dec<0) {
			seq=seq.substring(-dec);
		} else if (dec>0) {
			// on retire les nuclÃ©otides hors cadre
			let n=3-(dec%3);
			seq=seq.substring(n);
		}
	}
	let res = "";
	// mÃ©thode rapide mais qui est trÃ¨s longue avec les trÃ¨s grandes sÃ©quences car va jusqu'au bout
	
	// seq.match(/.{1,3}/g).forEach(s => {
		// var key = Object.keys(oCode.dico).filter(x => oCode.dico[x].filter(y => y === s).length > 0)[0]
		// res += key != undefined ? key : ''
	// })
	//res=res.split("!")[0];
	
	// mÃ©thode classique, codon par codon, s'arrÃªte dÃ¨s que codon stop
	let nbCodons=Math.floor(seq.length/3);
	for (let i=0;i<nbCodons;i++) {
		let cod=seq[i*3]+seq[i*3+1]+seq[i*3+2];
		let aa=oCode.dico2[cod];
		if (aa=="!") {break}
		res+=aa;
	}	
	return res;
}

oCode.getA3 = function (c1) {
	let index=oCode.tAa.findIndex(c=>c[2]==c1);
	// if (index<0) {return "XXX"} else {return oCode.tAa[index][1];}
	if (index<0) {return "Xxx"} else {return oCode.tAa[index][1];}
}

oCode.getFullAAName = function (c1) {
	let index=oCode.tAa.findIndex(c=>c[2]==c1);
	// if (index<0) {return "XXX"} else {return oCode.tAa[index][1];}
	if (index<0) {return "???"} else {return oCode.tAa[index][0];}
}

oCode.fromA3toA1 = function (c1) {
	let index=oCode.tAa.findIndex(c=>c[1].toUpperCase()==c1.toUpperCase());
	if (index<0) {return "X"} else {return oCode.tAa[index][2];}
}

oCode.traduitA3 = function (s) {
	let tA3=[];
	for (let i=0;i<s.length;i++) {
		tA3.push(oCode.getA3(s[i]));
	}
	return tA3;
}

oCode.toggleTableauCode = function () {
	oCode.tableauVisible=!oCode.tableauVisible;
	if (oCode.tableauVisible) {
		oDiv.maximiseDiv(2);
	} 
	oMenu.update();
}

oCode.toggleTableauAbrev = function () {
	oCode.abrevVisible=!oCode.abrevVisible;
	if (oCode.abrevVisible) {
		oDiv.maximiseDiv(3);
	} 
	oMenu.update();
}
