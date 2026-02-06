let lastClicTitre=0;
let oSeq={indelChar:"_",coche:{},nbMaxCarTitre:44,numer:0,
		codeAA3:true,decal:false,dureeMax:10000,timeOverError:false,pointMatch:false,carPointMatch:"êžŠ",colorNucl:true,
		startTime:0,blastMaxL:1800,algo:'auto',affBrinCpl:false,maxNbResEditable:1E6,maxNbResComparable:1E6,maxNbResEnzymable:1E6,isDeleting:false,
		listeAlgos:['diag','complete','best','quickstar','quickchain'],nCycleAlgo:0
}

// posCur correspond Ã  la position du curseur rouge selon la rÃ¨gle graduÃ©e choise (codon ou rÃ©sidu)
let oSeqNa={id:0,tSeq:[],i0Seq:0,matchString:"",posCur:-1,nSurvol:0}
let oSeqAl={id:1,tSeq:[],i0Seq:0,posCur:-1,nSurvol:0}
let oSeqEnz={id:-1,tSeq:[],i0Seq:0,posCur:-1,nSurvol:0}

oSeq.legitPRO = /^[ACDEFGHIKLMNPQRSTVWXY]+$/;  
oSeq.legitADN = /^[ACTGXNMYI]+$/;  
oSeq.legitARN = /^[ACUGXÎ¨NMYI]+$/;   // X = n'importe quelle base, Î¨ = pseudouridine

oSeq.devineType = function (seq) {
	let s=seq.replace(/-/g, '');
	s=s.replace(/_/g, '');
	s=s.replace(/X/g, '');
	s=s.replace(/Î¨/g, 'U');
	let l=s.length;
	let n=0;
	for (let i=0;i<l;i++) {
		if (["A","T","U","C","G"].includes(s[i])) {n++}
	}
	let p=n/l;
	if (p>0.9) {
		if (s.includes("U")) {
			return "ARN";
		} else {
			return "ADN";
		}
	} else {
		return "PRO";
	}
}

oSeq.diminueFS = function () {
	fontSizeMul-=0.1;
	if (fontSizeMul<0.6) {
		fontSizeMul=0.6;
	}
	doAfficheSequences();
	redim();
	doAfficheSequences();
}

oSeq.augmenteFS = function () {
	fontSizeMul+=0.1;
	if (fontSizeMul>1.5) {
		fontSizeMul=1.5;
	}
	doAfficheSequences();
	redim();
	doAfficheSequences();
}

oSeq.inverseSelSeq = function () {
	oMenu.exitMenu();
	let tTemp=[];
	for (let s of oSeqNa.tSeq) {
		if (s.sel) {
			if (s.type!="PRO") {
				tTemp.push(oSeq.inverse(s));
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
}

oSeq.inverse = function (s) {
	let seq=s.seq;
	let seqInv="";
	for (var i = seq.length - 1; i >= 0; i--) {
        seqInv += seq[i]; // on inverse l'ordre des lettres
    }	
	let titre=s.titre;
	titre=titre.substring(0,oSeq.nbMaxCarTitre-5); 
	titre+=" inv";
	return {titre:titre,type:s.type,seq:seqInv,sel:false,dec:s.dec,time:Date.now()+(oFile.incr++)}
}




oSeq.modifier = function () {
	let nId=oSeq.ctxNId;
	if (oSeqNa.tSeq[nId].seq.length>oSeq.maxNbResEditable) {
		avert({titre:"Avertissement",texte:"La sÃ©quence est trop longue pour pouvoir Ãªtre modifiÃ©e."});
		return false;
	}
	inputTextSequenceModif.value=oSeqNa.tSeq[nId].seq;
	show(divPanneauModifSeq);
	oMenu.update();
}

oSeq.dupliquer = function () {
	let nId=oSeq.ctxNId;
	let seq=JSON.parse(JSON.stringify(oSeqNa.tSeq[nId]));
	seq.time=Date.now();
	oSeqNa.tSeq.push(seq);
	oDist.compareSel();
	oSeq.afficheToutesSequences(true);
	oSeq.makeTitresUniques(oSeqNa.tSeq);
	oMenu.update();
}

oSeq.finModif = function () {
	let id=oSeq.ctxId;
	let nId=oSeq.ctxNId;
	let ooSeq,ooSeq2,ooSeq3;
	if (id==0) {ooSeq=oSeqNa;ooSeq2=oSeqAl;ooSeq3=oSeqEnz} 
	else if (id==1) {ooSeq=oSeqAl;ooSeq2=oSeqNa;ooSeq3=oSeqEnz;}
	else if (id==-1) {ooSeq=oSeqEnz;ooSeq2=oSeqNa;ooSeq3=oSeqAl;}
	let ctxSeq=ooSeq.tSeq[nId];
	let s=inputTextSequenceModif.value;
	s=s.toUpperCase();
	s=s.replace(/[^A-Z]+/g, ''); 
	let type=ctxSeq.type;
	if (oSeq.verifieTypeLegal(s,type)) {
		ctxSeq.seq=s;
		delete ctxSeq.pdb;
		// autres blocs de sÃ©quences
		let seq=ooSeq2.tSeq.find(c=>c.time==ctxSeq.time);
		if (typeof(seq)!="undefined") {
			seq.seq=s;
		}
		seq=ooSeq3.tSeq.find(c=>c.time==ctxSeq.time);
		if (typeof(seq)!="undefined") {
			seq.seq=s;
		}
		hide(divPanneauModifSeq);
		oSeq.afficheToutesSequences(true);
		oSeq.updateSel();
		if (oSeqAl.tSeq.some(c=>c.time==ctxSeq.time)) {
			lanceAlignement();
		}
		if (oEnz.mode) {
			oEnz.doActionEnz();
		}
		oMenu.update();
	} else {
		avert ({titre:"Avertissement",texte:"La sÃ©quence saisie contient des caractÃ¨res non autorisÃ©s pour le type '"+type+"'."});
	}	
}


oSeq.saisir = function () {
	selectTypeSaisie.value="ADN";
	inputTitreSeqSaisie.value="(sans nom)";
	inputTitreSeqSaisie.style.width=oSeq.nbMaxCarTitre/2+"em";
	inputTitreSeqSaisie.maxLength=oSeq.nbMaxCarTitre;
	inputTextSequenceSaisie.value="";
	show(divPanneauSaisieSeq);
	oMenu.update();
}

oSeq.finSaisie = function () {
	let seq=inputTextSequenceSaisie.value;
	seq=seq.toUpperCase();
	seq=seq.replace(/[^A-Z]+/g, ''); 
	let titre=inputTitreSeqSaisie.value;
	let type=selectTypeSaisie.value;
	if (oSeq.verifieTypeLegal(seq,type)) {
		oSeqNa.tSeq.push({titre:titre,type:type,dec:0,seq:seq,sel:true,time:Date.now()+(oFile.incr++)});
		oSeq.makeTitresUniques(oSeqNa.tSeq);
		hide(divPanneauSaisieSeq);
		oSeq.afficheToutesSequences(true);
		oSeq.updateSel();
		oMenu.update();
	} else {
		avert ({titre:"Avertissement",texte:"La sÃ©quence saisie contient des caractÃ¨res non autorisÃ©s pour le type '"+type+"'."});
	}	
}

oSeq.copierSel = function () {
	if (oSeqNa.tSeq.filter(c=>c.sel).length==0) {return false}
	let tSeq=oSeqNa.tSeq.filter(c=>c.sel);
	let txt="";
	let cr="\r\n";
	for (let s of tSeq) {
		txt+=">"+s.titre+cr;
		txt+=s.seq+cr;
		txt+=cr;
	}
	copyTextToClipboard(txt);	
	oMenu.update();
}

oSeq.setPointMatch = function (v) {
	if (v=="") {
		oSeq.togglePointMatch(false);
	} else {
		oSeq.togglePointMatch(true);
		oSeq.carPointMatch=v;
	}
	oMenu.update ();
	oSeq.afficheToutesSequences(true);
}

oSeq.togglePointMatch = function (v) {
	if (typeof(v)=="undefined") {
		oSeq.pointMatch=!oSeq.pointMatch;
	} else {
		oSeq.pointMatch=v;
	}
	oMenu.update ();
	oSeq.afficheToutesSequences(true);
}

oSeq.toggleColorNucl = function () {
	oSeq.colorNucl=!oSeq.colorNucl;
	oMenu.update ();
	oSeq.afficheToutesSequences(true);
}

oSeq.toggleAffBrinCpl = function () {
	oSeq.affBrinCpl=!oSeq.affBrinCpl;
	oSeq.afficheToutesSequences(true);
	oSeq.updateSel();
	oMenu.update();
}

oSeq.toggleDecal = function () {
	oSeq.decal=!oSeq.decal;
	oSeq.afficheToutesSequences(true);
	oSeq.updateSel();
	oMenu.update();
}

oSeq.decalSeq = function (ns,d) {
	oSeqNa.tSeq[ns].dec+=d;
	oSeq.afficheToutesSequences(true);
	oSeq.updateSel();
	oMenu.update();
}

oSeq.updateSel = function () {
	oSeq.calcLMaxAll();
	oDist.compareSel();
	if (searchActive) {doPerformSearch()}
	if (oEnz.mode) {oEnz.doActionEnz()}
	oSeq.afficheToutesSequences(true);
	oProt.nettoieCache();
	oDist.recalcTableauDist();
	oDist.calcDistPhen();
	oMenu.update();
}

oSeq.invertSelect = function () {
	oMenu.exitMenu();
	for (let s of oSeqNa.tSeq) {
		s.sel=!s.sel;
	}
	oSeq.updateSel();
}

oSeq.selectAll = function () {
	oMenu.exitMenu();
	for (let s of oSeqNa.tSeq) {
		s.sel=true;
	}
	oSeq.updateSel();
}

oSeq.deselectAll = function () {
	for (let s of oSeqNa.tSeq) {
		oMenu.exitMenu();
		s.sel=false;
	}
	oSeq.updateSel();
}

oSeq.verifieSeqAlNa = function () {
	let aRefaire=false;
	for (let s of oSeqAl.tSeq) {
		let titre=s.titre;
		if (!oSeqNa.tSeq.some(c=>(c.titre==titre))) {
			aRefaire=true;
			break;
		}
	}
	if (aRefaire) {
		lanceAlignement();
		oSeq.afficheToutesSequences(true);
	}
}

oSeq.eraseAll = function () {
	oModale.poseQuestion ("Voulez-vous vraiment supprimer toutes les sÃ©quences ?",function () {oSeq.doEraseAll ()});
}

oSeq.doEraseAll = function () {
	oSeq.isDeleting=true;
	oMenu.exitMenu();
	oSeqNa.tSeq=[];
	oSeqAl.tSeq=[];
	oSeqNa.i0Seq=0;
	oSeqAl.i0Seq=0;
	oSeq.updateSel();
	oSeq.isDeleting=false;
}

oSeq.supprCtx2 = function () {
	let ns=oSeq.ctx2ns;
	let seq=oSeqNa.tSeq[ns];
	let nPos=seq.nPos;
	let nOri=seq.oriPos;
	if (nOri===false) {
		nOri=nPos;
	}
	if (nOri==1) {
		seq.seq=seq.seq.slice(1);
	} else {
		seq.seq=seq.seq.substring(0,nOri-1)+seq.seq.substr(nOri,seq.seq.length);
	}
	hide (divSurlignePos);
	hide(divCtxMenu2);
	delete seq.seqA3; // force le recalcul de la sÃ©quence AA3
	oSeqNa.mustRender=true;
	oSeq.updateSel();
}

oSeq.supprAvantCtx = function () {
	let ns=oSeq.ctx2ns; // numÃ©ro d'ordre de la sÃ©quence
	let seq=oSeqNa.tSeq[ns];
	let nPos=seq.nPos;
	let nOri=seq.oriPos;
	if (nOri===false) {
		nOri=nPos;
	}
	seq.seq=seq.seq.substr(nOri-1,seq.seq.length);
	hide (divSurlignePos);
	hide(divCtxMenu2);
	delete seq.seqA3; // force le recalcul de la sÃ©quence AA3
	oSeqNa.mustRender=true;
	oSeq.updateSel();
}

oSeq.supprApresCtx = function () {
	let ns=oSeq.ctx2ns; // numÃ©ro d'ordre de la sÃ©quence
	let seq=oSeqNa.tSeq[ns];
	let nPos=seq.nPos;
	let nOri=seq.oriPos;
	if (nOri===false) {
		nOri=nPos;
	}
	seq.seq=seq.seq.substr(0,nOri);
	hide (divSurlignePos);
	hide(divCtxMenu2);
	delete seq.seqA3; // force le recalcul de la sÃ©quence AA3
	oSeqNa.mustRender=true;
	oSeq.updateSel();
}

oSeq.substitueCtx2 = function () {
	oSeq.ctx2type="substitue";
	let ns=oSeq.ctx2ns;
	let seq=oSeqNa.tSeq[ns];
	let nPos=seq.nPos;
	let nOri=seq.oriPos;
	if (nOri===false) {
		nOri=nPos;
	}
	let res=seq.seq[nOri-1];
	if ((seq.type=="PRO")&&(oSeq.codeAA3)) {
		res=oCode.getA3(res);
	}
	spanAncienNucl.innerHTML=res+"&nbsp;&#10233; ";
	if (seq.type=="PRO") {
		inputModifNucl.size=3;
		divModifNuclTitre.innerHTML="Substitution d'un acide aminÃ©";
		divModifNuclConsigne.innerHTML="Saisissez le code Ã  1 ou 3 lettres du nouvel acide aminÃ© puis cliquez sur OK.";
	} else if (seq.type=="ARN") {
		inputModifNucl.size=1;
		divModifNuclTitre.innerHTML="Substitution d'un nuclÃ©otide";
		divModifNuclConsigne.innerHTML="Saisissez la lettre du nouveau nuclÃ©otide (A,U,C,G) puis cliquez sur OK.";
	} else {
		inputModifNucl.size=1;
		divModifNuclTitre.innerHTML="Substitution d'un nuclÃ©otide";
		divModifNuclConsigne.innerHTML="Saisissez la lettre du nouveau nuclÃ©otide (A,T,C,G) puis cliquez sur OK.";
	}
	inputModifNucl.maxLength=inputModifNucl.size;
	
	hide (divSurlignePos);
	hide(divCtxMenu2);
	show(divFondModifNucl);
	inputModifNucl.focus();
	enableMenuSi("butModifNucl",false);
	inputModifNucl.value="";
}

oSeq.insereCtx2 = function (avant) {
	oSeq.ctx2type="insere";
	if (avant) {
		oSeq.ctx2type+="avant";
	} else {
		oSeq.ctx2type+="apres";
	}
	let ns=oSeq.ctx2ns;
	let seq=oSeqNa.tSeq[ns];
	let nPos=seq.nPos;
	let nOri=seq.oriPos;
	if (nOri===false) {
		nOri=nPos;
	}
	let res=seq.seq[nOri-1];
	if ((seq.type=="PRO")&&(oSeq.codeAA3)) {
		res=oCode.getA3(res);
	}
	spanAncienNucl.innerHTML="Code : ";
	if (seq.type=="PRO") {
		inputModifNucl.size=3;
		divModifNuclTitre.innerHTML="Insertion d'un acide aminÃ©";
		divModifNuclConsigne.innerHTML="Saisissez le code Ã  1 ou 3 lettres de l'acide aminÃ© Ã  insÃ©rer puis cliquez sur OK.";
	} else if (seq.type=="ARN") {
		inputModifNucl.size=1;
		divModifNuclTitre.innerHTML="Insertion d'un nuclÃ©otide";
		divModifNuclConsigne.innerHTML="Saisissez la lettre du nuclÃ©otide (A,U,C,G) Ã  insÃ©rer puis cliquez sur OK.";
	} else {
		inputModifNucl.size=1;
		divModifNuclTitre.innerHTML="Insertion d'un nuclÃ©otide";
		divModifNuclConsigne.innerHTML="Saisissez la lettre du nuclÃ©otide (A,T,C,G) Ã  insÃ©rer puis cliquez sur OK.";
	}
	inputModifNucl.maxLength=inputModifNucl.size;
	
	hide (divSurlignePos);
	hide(divCtxMenu2);
	show(divFondModifNucl);
	inputModifNucl.focus();
	enableMenuSi("butModifNucl",false);
	inputModifNucl.value="";
}

oSeq.checkValidModifNucl=function () {
	let ns=oSeq.ctx2ns;
	let seq=oSeqNa.tSeq[ns];
	let type=seq.type;
	inputModifNucl.value=inputModifNucl.value.toUpperCase();
	let r=inputModifNucl.value;
	
	let valid=true;
	if (r=="") {
		valid=false
	} else if (r.length==2) {
		valid=false;
	} else if (r.length==3) {
		r=oCode.fromA3toA1(r);
		valid=oSeq.verifieTypeLegal(r,type);
		if (r=="X") {valid=false}
	} else {
		valid=oSeq.verifieTypeLegal(r,type);
	}
	enableMenuSi("butModifNucl",valid);
}

oSeq.OKModifNucl = function () {
	let ns=oSeq.ctx2ns;
	let seq=oSeqNa.tSeq[ns];
	let nPos=seq.nPos;
	let nOri=seq.oriPos;
	let r=inputModifNucl.value;
	
	if ((seq.type=="PRO")&&(r.length==3)) {
		r=oCode.fromA3toA1(r);
	}
	
	if (nOri===false) {
		nOri=nPos;
	}
	
	if (oSeq.ctx2type=="substitue") {
		if (nOri==1) {
			seq.seq=r+seq.seq.slice(1);
		} else {
			seq.seq=seq.seq.substring(0,nOri-1)+r+seq.seq.substr(nOri,seq.seq.length);
		}
	} else if (oSeq.ctx2type=="insereavant") {
		if (nOri==1) {
			seq.seq=r+seq.seq;
		} else {
			seq.seq=seq.seq.substring(0,nOri-1)+r+seq.seq.substr(nOri-1,seq.seq.length);
		}
	} else if (oSeq.ctx2type=="insereapres") {
		console.log (r);
		seq.seq=seq.seq.substring(0,nOri)+r+seq.seq.substr(nOri,seq.seq.length);
	}
	
	delete seq.seqA3; // force le recalcul de la sÃ©quence AA3
	
	hide(divFondModifNucl);
	oSeqNa.mustRender=true;
	oSeq.updateSel();
}

oSeq.eraseSeqSel=function () {
	oModale.poseQuestion ("Voulez-vous vraiment supprimer les sÃ©quences sÃ©lectionnÃ©es ?",function () {oSeq.doEraseSeqSel ()});
}

oSeq.doEraseSeqSel = function () {
	oSeq.isDeleting=true;
	oMenu.exitMenu();
	oSeqNa.tSeq=oSeqNa.tSeq.filter(c=>(!c.sel));
	oSeq.verifieSeqAlNa ();
	oSeqNa.i0Seq=0;
	oSeqAl.i0Seq=0;
	oSeq.updateSel();
	oSeq.isDeleting=false;
}

oSeq.eraseSeqCtx = function () {
	oSeq.isDeleting=true;
	oMenu.exitMenu();
	let nId=oSeq.ctxNId;
	oSeqNa.tSeq[nId].titre="<suppr>";
	oSeqNa.tSeq=oSeqNa.tSeq.filter(c=>(c.titre!="<suppr>"));
	oSeq.verifieSeqAlNa();
	oSeqNa.i0Seq=0;
	oSeqAl.i0Seq=0;
	oSeq.updateSel();
	oSeq.isDeleting=false;
}

oSeq.remonteSeq = function (time) {
	let nId=oSeqNa.tSeq.findIndex(c=>c.time==time);
	if (nId<=0) {return false}
	let seqARemonter=JSON.parse(JSON.stringify(oSeqNa.tSeq[nId]));
	oSeqNa.tSeq.move(nId,nId-1);
	if (oEnz.mode) {
		oEnz.doActionEnz();
	}
	if (oSeqAl.tSeq.some(c=>c.time==time)) {
		lanceAlignement();
	}
	oSeq.updateSel();
}

oSeq.monteSecCtx = function () {
	oMenu.exitMenu();
	let id=oSeq.ctxId;
	let nId=oSeq.ctxNId;
	if (id==0) {ooSeq=oSeqNa;ooSeq2=oSeqAl;ooSeq3=oSeqEnz} 
	else if (id==1) {ooSeq=oSeqAl;ooSeq2=oSeqNa;ooSeq3=oSeqEnz;}
	else if (id==-1) {ooSeq=oSeqEnz;ooSeq2=oSeqNa;ooSeq3=oSeqAl;}
	let selSeq=ooSeq.tSeq[nId];	
	oSeq.remonteSeq(selSeq.time);
}

oSeq.remonteSeqSommet = function (time) {
	let nId=oSeqNa.tSeq.findIndex(c=>c.time==time);
	if (nId>=0) {
		let seqARemonter=JSON.parse(JSON.stringify(oSeqNa.tSeq[nId]));
		oSeqNa.tSeq.splice(nId,1);
		oSeqNa.tSeq.unshift(seqARemonter);
		if (oEnz.mode) {
			oEnz.doActionEnz();
		}
		if (oSeqAl.tSeq.some(c=>c.time==time)) {
			lanceAlignement();
		}
		oSeq.updateSel();	
	}	
}

oSeq.monteSommetSecCtx = function () {
	oMenu.exitMenu();
	let id=oSeq.ctxId;
	let nId=oSeq.ctxNId;
	if (id==0) {ooSeq=oSeqNa} 
	else if (id==1) {ooSeq=oSeqAl}
	let selSeq=ooSeq.tSeq[nId];
	let findSeq=oSeqNa.tSeq
	oSeq.remonteSeqSommet(selSeq.time);
}


oSeq.doRenommeCtxSeq=function () {
	let ooSeq,ooSeq2,ooSeq3;
	let id=oSeq.ctxId;
	let nId=oSeq.ctxNId;
	if (id==0) {ooSeq=oSeqNa;ooSeq2=oSeqAl;ooSeq3=oSeqEnz} 
	else if (id==1) {ooSeq=oSeqAl;ooSeq2=oSeqNa;ooSeq3=oSeqEnz;}
	else if (id==-1) {ooSeq=oSeqEnz;ooSeq2=oSeqNa;ooSeq3=oSeqAl;}
	let s=ooSeq.tSeq[nId];
	let titre=inputSaisieModaleTxt.value;
	titre=titre.trim();
	if (titre.length<1) {return false}
	if (titre==s.titre) {return false}
	s.titre=titre;
	oSeq.makeTitresUniques(ooSeq.tSeq);
	// renomme dans les autres bloc de sÃ©quences
	let seq=ooSeq2.tSeq.find(c=>c.time==s.time);
	if (typeof(seq)!="undefined") {
		seq.titre=s.titre;
	}
	seq=ooSeq3.tSeq.find(c=>c.time==s.time);
	if (typeof(seq)!="undefined") {
		seq.titre=s.titre;
	}
	oSeq.updateSel();
}

oSeq.renommerCtx=function () {
	oMenu.exitMenu();
	let ooSeq;
	let id=oSeq.ctxId;
	let nId=oSeq.ctxNId;
	if (id==0) {ooSeq=oSeqNa} 
	else if (id==1) {ooSeq=oSeqAl}
	else if (id==-1) {ooSeq=oSeqEnz}
	let s=ooSeq.tSeq[nId];
	spanSaisieModaleTxt.innerHTML="<i>Ancien nom : </i><br><b>"+s.titre+"</b><br><br>";
	spanSaisieModaleTxt.innerHTML+="<br><i>Veuillez saisir un nouveau nom pour cette sÃ©quence :</i><br><br>";
	inputSaisieModaleTxt.value=s.titre;
	inputSaisieModaleTxt.maxLength=oSeq.nbMaxCarTitre;
	show(divFondSaisieModale);
	inputSaisieModaleTxt.focus();
	inputSaisieModaleTxt.select();
}


oSeq.infosCtx = function () {
	oMenu.exitMenu();
	let ooSeq;
	let id=oSeq.ctxId;
	let nId=oSeq.ctxNId;
	if (id==0) {ooSeq=oSeqNa} 
	else if (id==1) {ooSeq=oSeqAl}
	else if (id==-1) {ooSeq=oSeqEnz}

	let seq=ooSeq.tSeq[nId];
	let txt="";	
	let idb="";
	let seqBank;
	if (typeof(seq.id)!="undefined") {
		idb=seq.id;
		seqBank=oBank.tSeq.find(c=>c.id==seq.id);
	}
	if (idb!="") {
		txt+="<b>"+seqBank.titreLong+" ("+seq.titre+")</b>";
	} else {
		txt+="<b>"+seq.titre+"</b>";
	}
	txt+="<br><br>";
	txt+="<div style='text-align:left;font-size:0.8em;width:100%;height:14em;overflow-y:auto'>";

	txt+="Type : ";
	let type=seq.type;
	let type2="";
	if (idb!="") {
		if (typeof (seqBank.type2)!="undefined") {
			type2=seqBank.type2;
		}
	} 
	if ((type=="ADN")&&(type2=="C")) {txt+="ADN (sÃ©quence codante uniquement)"}
	else if (type=="ADN") {txt+="ADN"}
	else if ((type=="ARN")&&(type2=="M")) {txt+="ARN messager"}
	else if ((type=="ARN")&&(type2=="PM")) {txt+="ARN prÃ©-messager"}
	else if ((type=="ARN")&&(type2=="C")) {txt+="ARN messager (sÃ©quence codante uniquement)"}
	else if (type=="ARN") {txt+="ARN"}
	else if (type=="PRO") {txt+="protÃ©ine"}
	
	txt+="<br><br>";
	txt+="Longueur : "+seq.seq.length;
	if (seq.type=="PRO") {txt+=" rÃ©sidus (acides aminÃ©s)"}
	else  {txt+=" nuclÃ©otides (bases azotÃ©es)"}
	if (idb!="") {
		if (typeof (seqBank.org)!="undefined") {
			if (seqBank.org!="") {
				txt+="<br><br>Organisme : <i>"+seqBank.org+"</i>";
			}
		}
		if (typeof (seqBank.gene)!="undefined") {
			if (seqBank.gene!="") {
				txt+="<br><br>Nom du gÃ¨ne : <i>"+seqBank.gene+"</i>";
			}
		}
		if (typeof (seqBank.chr)!="undefined") {
			if (seqBank.chr!="") {
				txt+="<br><br>Chromosome "+seqBank.chr;
			}
		}
		if (typeof (seqBank.idUni)!="undefined") {
			txt+="<br><br>Lien vers la page Uniprot (<a href=https://www.uniprot.org/uniprot/"+seqBank.idUni+" target=_blank>"+seqBank.idUni+"</a>)";
		}
	}
	if (searchActive) {
		txt+="<br><br>Nombre d'occurrences du motif recherchÃ© : "+getNbRepetitions(seq);
	}
	
	if ((oEnz.mode)&&(oSeq.ctxId==-1)) {
		// on est dans le mode enzymes de restriction, il faut rajouter la longueur de chaque segment
		let nSeq=Math.floor(nId/3);
		let frag=oElec.tPiste[nSeq].tLong;
		txt+="<br><br>Fragments de restriction : "+frag.length;
		for (let i=0;i<frag.length;i++) {
			txt+="<br>&nbsp;&nbsp;#"+(i+1)+" = "+frag[i]+" pdb";
		}
	}

	txt+="</div>";
	avert ({titre:"Informations sur une sÃ©quence",texte:txt});
}

oSeq.afficheToutesSequences = function (force) {
	oAnim.forceRender=force||false;
	oSeqNa.mustRender=true;
	oSeqAl.mustRender=true;
	oSeqEnz.mustRender=true;
}

oSeq.isOverCoche = function (x,y) {
	let over=false;
	let id=-1;
	if (x<(oSeq.exFont+2)) {
		for (let i=0;i<oSeq.coche.t.length;i++) {
			let tc=oSeq.coche.t[i];
			if ((y>tc)&&(y<tc+oSeq.coche.l)) {
				over=true;
				id=i;
				break;
			}
		}
	}
	return {over:over,id:id}
}

oSeq.isOverSequence = function (ooSeq,x) {
	let over=false;
	if (x>ooSeq.x0seq) {
		over=true;
	}
	return over;
}

oSeq.canvasSeqTouchEnd = function (ooSeq,e) {
	if (e.cancelable) {e.preventDefault();}
	ooSeq.scrollMove=false;
	let dn=Date.now();
	if ((dn-ooSeq.lastClick)<250) {
		// double click tactile sur la sÃ©quence
		ooSeq.lastClick=-1;
		let x=ooSeq.lastTouchX;
		let y=ooSeq.lastTouchY;
		oSeq.doDblClick(ooSeq,x,y);
		return false;
	}
	
	ooSeq.lastClick= dn;
	let ns=ooSeq.lastTouchNs;
	if (ns>=0) {
		let d=dn-ooSeq.lastTouchTime;
		if (d<300) {
			//console.log ("touchÃ© court");
			let xp=ooSeq.lastTouchX+ooSeq.canv.getBoundingClientRect().left;
			let yp=ooSeq.lastTouchY+ooSeq.canv.getBoundingClientRect().top-2*oSeq.eyFont/pixelRatio;
			divCtxMenu.style.left=xp+"px";
			divCtxMenu.style.top=yp+"px";
			oMenu.prepareCtxMenu(ooSeq,ns);
		}
	}
}

oSeq.canvasSeqTouchStart = function (ooSeq,e) {
	//console.log ("touchStart");
	//e.preventDefault();
	e.stopPropagation();
	oMenu.exitMenu();
	ooSeq.lastTouchNs=-1;
	hide (divPos);
	let canv=ooSeq.canv;
	let touches=e.touches;
	let nDoigts=touches.length;
	if (nDoigts!=1) {return false}
	let touche=touches[0];
	let x=touche.clientX-canv.getBoundingClientRect().left;
	let y=touche.clientY-canv.getBoundingClientRect().top;
	ooSeq.lastTouchX=x;
	ooSeq.lastTouchY=y;
	xx=x*pixelRatio;
	yy=y*pixelRatio;
	let coche;
	if (ooSeq.id!=0) {coche={over:false}} else 
		{coche=oSeq.isOverCoche (xx,yy);}
	let overSeq=oSeq.isOverSequence (ooSeq,xx);
	let overDecal=false;
	if ((oSeq.decal)&&(ooSeq.id==0)) {
		overDecal=(xx<(ooSeq.x0seq-oSeq.exFont))&&(xx>ooSeq.margeNoms);
	}
	let overRemonte=false;
	let ns=Math.floor(yy*ooSeq.tSeq.length/ooSeq.canv.height);
	if (ooSeq.id==0) {
		overRemonte=(xx<ooSeq.x0seq)&&(xx>(ooSeq.x0seq-oSeq.exFont))&&(ns>0);
	}
	if (overRemonte) {
		let seq=ooSeq.tSeq[ns];
		oSeq.remonteSeq(seq.time);
	} else if (overDecal) {
		// au dessus d'un bouton de dÃ©calage
		let gauche=false;
		if (ns>=0) {
			if (xx<(ooSeq.margeNoms+oSeq.exFont)) {
				gauche=true;
			}
			if (gauche) {
				oSeq.decalSeq(ns,-1);
			} else {
				oSeq.decalSeq(ns,+1);
			}
		}
	} else if (coche.over) {
		// case cochÃ©e
		ooSeq.tSeq[coche.id].sel=!ooSeq.tSeq[coche.id].sel;
		ooSeq.scrollMove=false;
		oAnim.forceRender=true;
		oSeq.updateSel();
	} else if (overSeq) {
		// au dessus sÃ©quence
		oSeq.affichePos (ooSeq,xx,yy);
		ooSeq.scrollMove=true;
		ooSeq.curseurX0=xx;
		ooSeq.lasti0Seq=ooSeq.i0Seq;
	} else if ((xx>oSeq.exFont)&&(xx<ooSeq.margeNoms)) {
		// ni sur la sÃ©quence de nucl, ni sur une coche, bien Ã  droite de coche => sur un titre 
		if ((ns>=0)&&(ns<ooSeq.tSeq.length)&&(ooSeq.id==0)&&(xx>(oSeq.exFont*2))) {
			ooSeq.lastTouchNs=ns;
			ooSeq.lastTouchTime= Date.now(); // l'event Ã©quivalent au clic droit se dÃ©clenchera au touch end
		}
	}
	ooSeq.mustRender=true;
}

oSeq.canvasSeqWheel = function (ooSeq,e) {
	if (e.ctrlKey ) {e.preventDefault()}
	let delta=e.deltaX;
	if (delta==0) {return false}
	let pas=Math.ceil(ooSeq.lSeqCanv*0.8);
	if (delta>0) {
		ooSeq.i0Seq+=pas;
	} else {
		ooSeq.i0Seq-=pas;
	}
	if (ooSeq.i0Seq<0) {ooSeq.i0Seq=0}
	if (ooSeq.i0Seq>ooSeq.iMaxSeq) {ooSeq.i0Seq=ooSeq.iMaxSeq}
	ooSeq.mustRender=true;
}

oSeq.canvasGradMouseMove =function (ooSeq,e) {
	hide (divSurlignePos);
	if (ooSeq.id==1) {return false}
	let canv=ooSeq.canvGrad;
	let xx=e.clientX-canv.getBoundingClientRect().left;
	let x=xx*pixelRatio;
	let yy=e.clientY-canv.getBoundingClientRect().top;
	let y=yy*pixelRatio;
	hide (divPos);
	if ((x<oSeq.exFont)&&(y<oSeq.eyFont)) {
		canv.style.cursor="pointer";
	} else 	if ((x>ooSeq.x0seq)&&(e.buttons==0)&&(!oSeq.queProt)) { // on est au dessus des graduations sans cliquer
		canv.style.cursor="pointer";
		divPos.innerHTML="Double cliquer pour changer le mode de numÃ©rotation";
		show (divPos);
		let xp=xx+ooSeq.canvGrad.getBoundingClientRect().left;
		let yp=yy+ooSeq.canvGrad.getBoundingClientRect().top-2*oSeq.eyFont/pixelRatio;
		divPos.style.left=xp+"px";
		divPos.style.top=yp+"px";
		e.stopPropagation();
	} else {
		canv.style.cursor="default";
	}
}

oSeq.canvasGradMouseDown = function (ooSeq,e) {
	hide (divPos);
	oSeqNa.nSurvol=-1;
	oSeqAl.nSurvol=-1;
	oSeqEnz.nSurvol=-1;
	let canv=ooSeq.canvGrad;
	let x=e.clientX-canv.getBoundingClientRect().left;
	x*=pixelRatio;
	let y=e.clientY-canv.getBoundingClientRect().top;
	y*=pixelRatio;
	if (ooSeq.id==0) {
		if ((x<oSeq.exFont)&&(y<oSeq.eyFont)) {
			// on a cliquÃ© sur la case de/select all
			if (ooSeq.selectAll==0) {
				oSeq.selectAll();
			} else  {
				oSeq.deselectAll();
			}
			return false;
		}
	}
	
	if (x>ooSeq.x0seq) { // on est au dessus des graduations
		if ((Date.now()-ooSeq.lastClick)<400) {
			// double click sur la graduation
			ooSeq.lastClick=-1;
			oSeq.toggleGrad();
			return false;
		}
	}
	ooSeq.lastClick= Date.now();
}

oSeq.canvasSeqClick =function (ooSeq,e) {
	if ((Date.now()-ooSeq.lastClick) >250) {
		// ce n'est pas un double Clic
		return false
	}
	ooSeq.lastClick= Date.now();
	e.stopPropagation();
	if (e.cancelable) {e.preventDefault();}
	hide (divPos);
	hide(divCtxMenu);
	hide(divCtxMenu2);
	let canv=ooSeq.canv;
	let x=e.clientX-canv.getBoundingClientRect().left;
	xx=x*pixelRatio;
	let y=e.clientY-canv.getBoundingClientRect().top;
	yy=y*pixelRatio;
	let coche;
	if (ooSeq.id!=0) {coche={over:false}} else 
			{coche=oSeq.isOverCoche (xx,yy);}
	let overSeq=oSeq.isOverSequence (ooSeq,xx);
	let overDecal=false;
	let ns=Math.floor(yy*ooSeq.tSeq.length/ooSeq.canv.height);
	if ((oSeq.decal)&&(ooSeq.id==0)) {
		overDecal=(xx<(ooSeq.x0seq-oSeq.exFont))&&(xx>ooSeq.margeNoms);
	}
	let overRemonte=false;
	if (ooSeq.id==0) {
		overRemonte=(xx<ooSeq.x0seq)&&(xx>(ooSeq.x0seq-oSeq.exFont))&&(ns>0);
	}
	
	if (overSeq) {
		let pos=oSeq.getPosGrad (ooSeq,xx,yy);
		setCurseurRougeTo (ooSeq,pos);
	} else if (overRemonte) {
		let seq=ooSeq.tSeq[ns];
		oSeq.remonteSeq(seq.time);
	} else 	if (overDecal) {
		// au dessus d'un bouton de dÃ©calage
		let gauche=false;
		if (ns>=0) {
			if (xx<(ooSeq.margeNoms+oSeq.exFont)) {
				gauche=true;
			}
			if (gauche) {
				oSeq.decalSeq(ns,-1);
			} else {
				oSeq.decalSeq(ns,+1);
			}
		}
	} else if (coche.over) {
		// on est au dessus d'une coche
		ooSeq.tSeq[coche.id].sel=!ooSeq.tSeq[coche.id].sel;
		oAnim.forceRender=true;
		oSeq.updateSel();
	} 
	
}

oSeq.canvasSeqMouseDown = function (ooSeq,e) {
	ooSeq.lastClick= Date.now();
	if (e.cancelable) {e.preventDefault();}
	hide (divPos);
	hide(divCtxMenu);
	hide(divCtxMenu2);
	let canv=ooSeq.canv;
	let x=e.clientX-canv.getBoundingClientRect().left;
	xx=x*pixelRatio;
	let y=e.clientY-canv.getBoundingClientRect().top;
	yy=y*pixelRatio;
	let coche;
	if (ooSeq.id!=0) {coche={over:false}} else 
			{coche=oSeq.isOverCoche (xx,yy);}
	let overSeq=oSeq.isOverSequence (ooSeq,xx);
	let overDecal=false;
	let ns=Math.floor(yy*ooSeq.tSeq.length/ooSeq.canv.height);
	if ((oSeq.decal)&&(ooSeq.id==0)) {
		overDecal=(xx<(ooSeq.x0seq-oSeq.exFont))&&(xx>ooSeq.margeNoms);
	}

	if (e.buttons==1) {//bouton gauche}	
		ooSeq.nSurvol=-1;
		if (overSeq) {
			// on est au dessus de la sÃ©quence de nuclÃ©otides/rÃ©sidus
			ooSeq.scrollMove=true;
			ooSeq.curseurX0=xx;
			ooSeq.lasti0Seq=ooSeq.i0Seq;
		} else if ((xx>oSeq.exFont)&&(xx<ooSeq.margeNoms)&&(!overDecal)) {
			// on a cliquÃ© au dessus d'un titre
			if (ns>=0) {
				ooSeq.nSurvol=ns;
				if ((Date.now()-lastClicTitre)<250) {
					// double clic au niveau d'un titre de sÃ©quence
					oSeq.ctxNId=ns;
					ooSeq.nSurvol=ns;
					oSeq.ctxId=ooSeq.id;
					oSeq.renommerCtx();
				} else {
					lastClicTitre=Date.now();
				}
			}
		}
	} else if (e.buttons!=0) { // clic droit
		if ((xx>oSeq.exFont)&&(xx<ooSeq.margeNoms)&&(!overDecal)) {
			// on est au dessus d'un titre
			if (ns>=0) {
				let xp=x+ooSeq.canv.getBoundingClientRect().left;
				let yp=y+ooSeq.canv.getBoundingClientRect().top-2*oSeq.eyFont/pixelRatio;
				divCtxMenu.style.left=xp+"px";
				divCtxMenu.style.top=yp+"px";
				oMenu.prepareCtxMenu(ooSeq,ns);
			}
		} else if (overSeq) {
			// clic droit au dessus sÃ©quence
			if ((ns>=0)&&(ooSeq.id==0)) {
				let xp=x+ooSeq.canv.getBoundingClientRect().left;
				let yp=y+ooSeq.canv.getBoundingClientRect().top-2*oSeq.eyFont/pixelRatio;
				divCtxMenu2.style.left=xp+"px";
				divCtxMenu2.style.top=yp+"px";
				oMenu.prepareCtxMenu2(ns);
			}
		}
	}
	ooSeq.mustRender=true;
}

oSeq.canvasSeqMouseMove = function (ooSeq,e) {
	ooSeq.nSurvol=-1;
	if (e.buttons==0) {
		e.stopPropagation();
	}
	hide (divSurlignePos);
	hide(divCtxMenu);
	hide(divCtxMenu2);
	let canv=ooSeq.canv;
	let x=e.clientX-canv.getBoundingClientRect().left;
	let y=e.clientY-canv.getBoundingClientRect().top;
	let xx=x*pixelRatio;
	let yy=y*pixelRatio;
	// pointeur souris si au dessus de case
	let coche;
	if (ooSeq.id!=0) {coche={over:false}} else 
		{coche=oSeq.isOverCoche (xx,yy);}
	let overSeq=oSeq.isOverSequence (ooSeq,xx);
	let overDecal=false;
	let ns=Math.floor(yy*ooSeq.tSeq.length/ooSeq.canv.height);
	if ((oSeq.decal)&&(ooSeq.id==0)) {
		overDecal=(xx<(ooSeq.x0seq-oSeq.exFont))&&(xx>ooSeq.margeNoms);
	}
	let overRemonte=false;
	if (ooSeq.id==0) {
		overRemonte=(xx<ooSeq.x0seq)&&(xx>(ooSeq.x0seq-oSeq.exFont))&&(ns>0);
	}
	if ((overDecal)||(coche.over)||(overRemonte)) {
		canv.style.cursor="pointer";
	}  else if (overSeq) {
		canv.style.cursor="all-scroll";
	} else {
		canv.style.cursor="auto";
	}
	
	// on indique le numÃ©ro du nuclÃ©otide ou codon
	hide(divPos);
	if (overDecal) {
		//
	} else if (overSeq) {
		oSeq.affichePos (ooSeq,xx,yy);
	} else if (coche.over) {
		//
	} else if ((xx>oSeq.exFont)&&(xx<ooSeq.margeNoms)) { 
		// on est au dessus d'un titre
		if (ooSeq.nSurvol!=ns) {
			ooSeq.nSurvol=ns;
			ooSeq.mustRender=true;
		}
		if (ns>=0) {
			let seq=ooSeq.tSeq[ns];
			let seqBank;
			let seqId="";
			if (seq.titre!="") {
				let txt="<b>"+seq.titre+"</b>";
				if (typeof(seq.id)!="undefined") {
					seqId=seq.id;
					seqBank=oBank.tSeq.find(c=>c.id==seq.id);
					txt="<b>"+seqBank.titreLong+"</b>";
				}
				txt+="<br><br>";
				
				txt+="Type : ";
				let type=seq.type;
				let type2="";
				if (seqId!="") {
					if (typeof (seqBank.type2)!="undefined") {
						type2=seqBank.type2;
					}
				} 
				if ((type=="ADN")&&(type2=="C")) {txt+="ADN (sÃ©quence codante uniquement)"}
				else if (type=="ADN") {txt+="ADN"}
				else if ((type=="ARN")&&(type2=="M")) {txt+="ARN messager"}
				else if ((type=="ARN")&&(type2=="PM")) {txt+="ARN prÃ©-messager"}
				else if ((type=="ARN")&&(type2=="C")) {txt+="ARN messager (sÃ©quence codante uniquement)"}
				else if (type=="ARN") {txt+="ARN"}
				else if (type=="PRO") {txt+="protÃ©ine"}
				
				if (seqId!="") {
					if (typeof (seqBank.org)!="undefined") {
						if (seqBank.org!="") {
							txt+="<br><br>Organisme : <i>"+seqBank.org+"</i>";
						}
					}
					if (typeof (seqBank.chr)!="undefined") {
						if (seqBank.chr!="") {
							txt+="<br><br>Chromosome "+seqBank.chr;
						}
					}
				}
				if (searchActive) {
					txt+="<br><br>Nb d'occurrences du motif recherchÃ© : "+getNbRepetitions(seq);
				}
				txt+="<br><br>";
				txt+="Clic droit pour ouvrir un menu contextuel";
				divPos.innerHTML=txt;
				show (divPos);
				let xp=x+ooSeq.canv.getBoundingClientRect().left;
				let yp=y+ooSeq.canv.getBoundingClientRect().top-2*oSeq.eyFont/pixelRatio;
				divPos.style.left=xp+"px";
				divPos.style.top=yp+"px";
			}
		}
	}
}


oSeq.getNSeqFromY = function (ooSeq,y) {
	let nLigne=Math.floor(y/oSeq.eyFont);
	if ((!oSeq.affBrinCpl)||(ooSeq.id==-1)) {
		return nLigne;
	}
	for (let i=0;i<ooSeq.tSeq.length;i++) {
		let seq=ooSeq.tSeq[i];
		let nPos=seq.nPosY;
		if (seq.type=="ADN") {
			if ((nLigne==nPos)||(nLigne==(nPos+1))) {
				return i;
			}
		} else {
			if (nLigne==nPos) {
				return i;
			}
		}
	}
	return false;
}
oSeq.getPosGrad = function (ooSeq,x,y) {
	let xx=x/pixelRatio+ooSeq.canv.getBoundingClientRect().left;
	let yy=y/pixelRatio+ooSeq.canv.getBoundingClientRect().top-2*oSeq.eyFont/pixelRatio;
	x-=ooSeq.x0seq;
	let xCar=x/oSeq.exFont;
	nPos=Math.floor(ooSeq.i0Seq+xCar);
	return nPos;
}

oSeq.affichePos = function (ooSeq,x,y) {
	hide (divSurlignePos);
	let xx=x/pixelRatio+ooSeq.canv.getBoundingClientRect().left;
	let yy=y/pixelRatio+ooSeq.canv.getBoundingClientRect().top-2*oSeq.eyFont/pixelRatio;
	x-=ooSeq.x0seq;
	let nSeq=oSeq.getNSeqFromY(ooSeq,y);
	if (nSeq===false) {return false}
	if ((nSeq<0)||(nSeq>=ooSeq.tSeq.length)) {
		hide(divPos);
		return false;
	}
	let seq=ooSeq.tSeq[nSeq];
	let xCar=x/oSeq.exFont; // position exprimÃ©e en caractÃ¨res (pas forcÃ©ment en rÃ©sidu)
	if (oSeq.decal) {
		if (seq.type=="PRO") {
			if (seq.nCarre==3) {
				// dÃ©calage de 1/3 ou 2/3 
				xCar-=(seq.dec%3);
			} else {
				xCar-=(seq.dec%3)/3;
			}
		}
	}
	let txt="";
	let posMax=seq.seq.length;
	let nPos;
	if (seq.type=="PRO") {
		if ((oSeq.queProt)&&(!oSeq.codeAA3)) {
			// on a que de la protÃ©ine ET code 1 lettre
			nPos=Math.floor(ooSeq.i0Seq+xCar)+1;
			txt="Position : "+nPos;	
		} else {
			// que ce soit code 1 lettre ou 3 lettres, on a 3 caractÃ¨res de large
			nPos=Math.floor(ooSeq.i0Seq+xCar);
			nPos=Math.floor(nPos/3)+1;
			txt="Position : "+nPos;
		}
	} else {
		nPos=Math.floor(ooSeq.i0Seq+xCar);
		let nCod=Math.floor(nPos/3)+1;
		nPos++;
		txt="Position : "+nPos+"<br>Codon : "+nCod;
	}
	
	// position originale 
	let oriPos=nPos;
	if (ooSeq.id==1) {
		oriPos=oDist.originalPos(seq.seq,nPos-1);
		if (oriPos!==false) {
			let decNa=0;
			oriPos++;
			txt+="<br><br>Position originale : ";
			if (oSeq.decal) {
				// on prend en compte le dÃ©calage, mais dans seqNa
				// on retrouve la sÃ©quence correspondante grÃ¢ce a timeCode
				let seqNa=oSeqNa.tSeq.find(c=>c.time==seq.time);
				decNa=seqNa.dec;
				if (seq.type=="PRO") {
					decNa=Math.round(decNa/3);
				} 
			}
			let oriPosAvecDec=oriPos+decNa;
			if (decNa!=0) {
				txt+=oriPosAvecDec+" ("+oriPos+")";
			} else {
				txt+=oriPos;
			}
		}
	} else if ((ooSeq.id==0)&&(oSeq.decal)) {
		// on prend en compte le dÃ©calage
		let dec2=seq.dec;
		if (seq.type=="PRO") {
			dec2=Math.round(dec2/3);
		} 
		oriPos-=dec2;
		if (dec2!=0) {
			txt+=" ("+oriPos+")";
		}
	}
	
	seq.oriPos=oriPos;
	seq.nPos=nPos;
	
	// molÃ©cule 3D => mise en Ã©vidence du rÃ©sidu correspondant
	if (oriPos!==false) {
		if (ooSeq.id>=0) {
			if ((!oSeq.queProt)||(oSeq.codeAA3)) {
				if (typeof(seq.pdb)!="undefined") {
					if (seq.pdb.code==oProt.pdbCode) {
						let memeChaine=true;
						if (typeof (seq.pdb.chaine)!="undefined") {
							memeChaine=(seq.pdb.chaine==oProt.chain);
						}
						if (memeChaine) {
							oProt.selRes (oriPos);
						}
					}
				}
			} 
		}
	}
	
	if (nPos>posMax) {hide(divPos);seq.nPos=false;return false}
	show (divPos);
	divPos.innerHTML=txt;
	divPos.style.left=xx+"px";
	divPos.style.top=yy+"px";
	
	if (ooSeq.id==0) {
		oSeq.positionneSurligne(nSeq,nPos);
	}
}

oSeq.positionneSurligne = function (nSeq,nPos) {
	let seq=oSeqNa.tSeq[nSeq];
	let lCarre=seq.lCarre/pixelRatio;
	let nCarre=seq.nCarre;
	nPos-=oSeqNa.i0Seq/nCarre;
	let x=(nPos-1)*lCarre+oSeqNa.x0seq/pixelRatio;
	
	let dec=seq.dec;
	if (oSeq.decal) {
		if (nCarre==3) {
			x+=dec%3*oSeq.exFont/pixelRatio;
		} 
	}
	
	if (x<(oSeqNa.x0seq/pixelRatio)) {return false}
	
	let y0=oSeqNa.canv.getBoundingClientRect().top;
	let y=seq.nPosY*oSeq.eyFont/pixelRatio;
	
	x-=0.5; // dÃ©calage dÃ» au border
	y-=0.5;
	
	divSurlignePos.style.width=lCarre+"px";
	divSurlignePos.style.left=x+"px";
	divSurlignePos.style.top=y+"px";
	show (divSurlignePos);
}

oSeq.canvasSeqCurTouchStart = function (ooSeq,e) {
	//console.log ("touchStartCur");
	//e.preventDefault();
	e.stopPropagation();
	oMenu.exitMenu();
	let canv=ooSeq.canv;
	let touches=e.touches;
	let nDoigts=touches.length;
	if (nDoigts!=1) {return false}
	let touche=touches[0];
	let x=touche.clientX-canv.getBoundingClientRect().left;
	let xx=x*pixelRatio;
	//console.log (x,ooSeq.xCurseur);
	if ((xx>ooSeq.xCurseur)&&(xx<(ooSeq.xCurseur+ooSeq.lCurseur))) {
		ooSeq.overCurseurSeq=true;
	} else {
		ooSeq.overCurseurSeq=false;
	}
	if (!ooSeq.overCurseurSeq) {
		// on a cliquÃ© sur la barre mais en dehors du curseur
		let xRel=x/canv.getBoundingClientRect().width;
		let iSeq=Math.round(ooSeq.lSeqMax*xRel);
		ooSeq.i0Seq=iSeq-ooSeq.lSeqCanv/2;
		if (ooSeq.i0Seq<0) {ooSeq.i0Seq=0}
	}
	ooSeq.boutonCurseurSeq=true;
	ooSeq.curseurX0=xx;
	ooSeq.lasti0Seq=ooSeq.i0Seq;
	ooSeq.mustRender=true;
}

oSeq.canvasSeqCurMouseDown = function (ooSeq,e) {
	//console.log ("mouseDownCur");
	let canv=ooSeq.canv;
	let x=e.clientX-canv.getBoundingClientRect().left;
	let xx=x*pixelRatio;
	if (!ooSeq.overCurseurSeq) {
		// on a cliquÃ© sur la barre mais en dehors du curseur
		let xRel=x/canv.getBoundingClientRect().width;
		let iSeq=Math.round(ooSeq.lSeqMax*xRel);
		ooSeq.i0Seq=iSeq-ooSeq.lSeqCanv/2;
		if (ooSeq.i0Seq<0) {ooSeq.i0Seq=0}
	}
	ooSeq.boutonCurseurSeq=true;
	ooSeq.curseurX0=xx;
	ooSeq.lasti0Seq=ooSeq.i0Seq;
	ooSeq.mustRender=true;
}

oSeq.canvasSeqCurMouseMove = function (ooSeq,e) {
	hide (divSurlignePos);
	let canv=ooSeq.canvCur;
	let lCanv=canv.width;
	let x=e.clientX-canv.getBoundingClientRect().left;
	let xx=x*pixelRatio;
	if ((xx>ooSeq.xCurseur)&&(xx<(ooSeq.xCurseur+ooSeq.lCurseur))) {
		ooSeq.overCurseurSeq=true;
	} else {
		ooSeq.overCurseurSeq=false;
	}
}

oSeq.moveCurseurSeq = function (ooSeq,x) {
	let lCanv=ooSeq.canv.width;
	if (ooSeq.iMaxSeq<=0) {return false}
	ooSeq.i0Seq=ooSeq.lasti0Seq+(x-ooSeq.curseurX0)*ooSeq.lSeqMax/lCanv;
	if (ooSeq.i0Seq<0) {ooSeq.i0Seq=0}
	if (ooSeq.i0Seq>(ooSeq.iMaxSeq+1)) {ooSeq.i0Seq=ooSeq.iMaxSeq+1}
	ooSeq.mustRender=true;
}

oSeq.moveSeq = function (ooSeq,x) {
	let dx=x-ooSeq.curseurX0;
	let lCanv=ooSeq.canv.width;
	if (ooSeq.iMaxSeq<=0) {return false}
	ooSeq.i0Seq=ooSeq.lasti0Seq-dx/oSeq.exFont;
	if (ooSeq.i0Seq<0) {ooSeq.i0Seq=0}
	if (ooSeq.i0Seq>ooSeq.iMaxSeq) {ooSeq.i0Seq=ooSeq.iMaxSeq}
	ooSeq.mustRender=true;
}

oSeq.drawDecalBut = function () {
	let canv=oSeqNa.canv;
	let ctx=canv.getContext('2d');
	ctx.strokeStyle="black";
	ctx.fillStyle="#555";
	let x2=oSeqNa.x0seq-oSeq.exFont*2;
	let x1=x2-oSeq.exFont;
	for (let ns=0;ns<oSeqNa.tSeq.length;ns++) {
		let y=oSeqNa.tSeq[ns].nPosY*oSeq.eyFont;
		ctx.strokeRect(x1,y,oSeq.exFont,oSeq.eyFont);
		ctx.strokeRect(x2,y,oSeq.exFont,oSeq.eyFont);
		ctx.beginPath ();
		ctx.moveTo (x1+oSeq.exFont*0.2,y+oSeq.eyFont/2);
		ctx.lineTo (x1+oSeq.exFont*0.9,y+oSeq.eyFont*0.1);
		ctx.lineTo (x1+oSeq.exFont*0.9,y+oSeq.eyFont*0.9);
		ctx.fill();
		ctx.beginPath ();
		ctx.moveTo (x2+oSeq.exFont*0.8,y+oSeq.eyFont/2);
		ctx.lineTo (x2+oSeq.exFont*0.1,y+oSeq.eyFont*0.1);
		ctx.lineTo (x2+oSeq.exFont*0.1,y+oSeq.eyFont*0.9);
		ctx.fill();
	}
}

oSeq.drawRemonteBut = function () {
	let canv=oSeqNa.canv;
	let ctx=canv.getContext('2d');
	ctx.strokeStyle="black";
	ctx.fillStyle="#555";
	let x=oSeqNa.x0seq-oSeq.exFont;
	for (let ns=1;ns<oSeqNa.tSeq.length;ns++) {
		let y=oSeqNa.tSeq[ns].nPosY*oSeq.eyFont;
		ctx.strokeRect(x,y,oSeq.exFont,oSeq.eyFont);
		ctx.beginPath ();
		ctx.moveTo (x+oSeq.exFont/2,y+oSeq.eyFont*0.2);
		ctx.lineTo (x+oSeq.exFont*0.1,y+oSeq.eyFont*0.8);
		ctx.lineTo (x+oSeq.exFont*0.9,y+oSeq.eyFont*0.8);
		ctx.fill();
	}
}

oSeq.calcLMaxAll = function () {
	oSeq.calcLMax (oSeqNa);
	oSeq.calcLMax (oSeqAl);
	oSeq.calcLMax (oSeqEnz);
		
	let oldNumer=oSeq.numer;
	let oldAAMul=oSeq.aaMul;
	oSeq.queProt=false;
	oSeq.aaMul=3;
	if (oSeqNa.tSeq) {
		if (oSeqNa.tSeq.length>0) {
			oSeq.queProt=!((oSeqNa.tSeq.some(c=>c.type!="PRO"))||(oSeqAl.tSeq.some(c=>c.type!="PRO")));
			if (oSeq.queProt) {
				oSeq.numer=1;
				if (!oSeq.codeAA3) {
					oSeq.aaMul=1;
				}
			}
		}
	}
	if ((oldNumer!=oSeq.numer)||(oldAAMul!=oSeq.aaMul)) {
		resetCurseurRouge();
	}
}

oSeq.calcLMax = function (ooSeq) {
	// lSeqMax longueur max en nombre de caractÃ¨res  Ã  l'Ã©cran
	// lResMax longueur max en nombre de rÃ©sidus
	ooSeq.lSeqMax=0;
	
	for (let s of ooSeq.tSeq) {
		let l=s.seq.length;
		if (s.type=="PRO") {l*=oSeq.aaMul}
		if (l>ooSeq.lSeqMax) {ooSeq.lSeqMax=l}
	}
	ooSeq.lResMax=0;
	for (let s of ooSeq.tSeq) {
		let l=s.seq.length;
		if (l>ooSeq.lResMax) {ooSeq.lResMax=l}
	}
}

oSeq.doChangeIndelChar = function () {
	for (let s of oSeqAl.tSeq) {
		if (oSeq.indelChar=="_") {
			s.seq=s.seq.replace(/-/g, '_');
			for (let i=0;i<s.seqA3.length;i++) {
				if (s.seqA3[i]=="-") {s.seqA3[i]="_"}
			}
		} else {
			s.seq=s.seq.replace(/_/g, '-');
			for (let i=0;i<s.seqA3.length;i++) {
				if (s.seqA3[i]=="_") {s.seqA3[i]="-"}
			}
		}
	}
}

oSeq.changeIndelChar = function (c) {
	oSeq.indelChar=c;
	oSeq.doChangeIndelChar();
	oMenu.update();
	oSeq.afficheToutesSequences (true);
}

oSeq.demo=function() {
	let id=oBank.tSeq.findIndex(c=>c.id=="PAC-MITOC-NEAND");
	oBank.tSel.push(id);
	oBank.loadSelection();
	return false;
}


oSeq.toutesSelMemeType = function () {
	let tSeq=oSeqNa.tSeq.filter(c=>c.sel);
	if (tSeq.length<2) {return false}
	let erreurType=false;
	let type0=tSeq[0].type;
	for (let i=1;i<tSeq.length;i++) {
		if (tSeq[i].type[0]!=type0[0]) { // on ne prend que la premiÃ¨re lettre Adn, Arn, Pro
			erreurType=true;
			break;
		}
	}
	return !erreurType;
}

oSeq.toggleTableau = function () {
	tableauVisible=!tableauVisible;
	if (tableauVisible) {
		oDiv.maximiseDiv(0);
		oDist.recalcTableauDist();
	} 
	oMenu.update();
}

oSeq.togglePhenog = function () {
	phenogVisible=!phenogVisible;
	if (oUPGMA.noTree) {phenogVisible=false}
	if (phenogVisible) {
		oDiv.maximiseDiv(1);
	}
	oMenu.update();
}

oSeq.toggleGrad = function () {
	if (!(!oSeq.queProt)&&(oSeqNa.tSeq.length>0)) {return false}
	oSeq.changeNumer (1-oSeq.numer);	
}

oSeq.changeNumer = function (n) {
	oSeq.numer=n;
	oMenu.exitMenu();
	oMenu.update();
	oSeq.afficheToutesSequences(true);
	resetCurseurRouge();
}

oSeq.changeCodeAA3 = function (c) {
	oSeq.codeAA3=c;
	oMenu.exitMenu();
	oMenu.update();
	oSeqNa.i0Seq=0;
	oSeqAl.i0Seq=0;
	oSeq.afficheToutesSequences(true);
	resetCurseurRouge();
}

oSeq.verifieTypeLegal=function (s,type) {
	if (type=="PRO") {
		return (s.match(oSeq.legitPRO))!=null;
	} else if (type=="ADN") {
		return (s.match(oSeq.legitADN))!=null;
	} else if (type=="ARN") {
		return (s.match(oSeq.legitARN))!=null;
	}
	return false;
}

oSeq.trouveCaracIllegalADN = function (s) {
	let txt="";
	for (let i=0;i<s.length;i++) {
		if ((s[i].match(oSeq.legitADN))==null) {
			txt+=s[i]+"{"+i+"}, ";
		}
	}
	return txt;
}

oSeq.nettoieSeq = function  (s,type) {
	// remplace tous les caractÃ¨re non lÃ©gitimes par des X
	let s2="";
	let legMatch=oSeq.legitPRO;
	if (type=="ADN") {legMatch=oSeq.legitADN} 
	else if (type=="ARN") {legMatch=oSeq.legitARN} 
	else if (type=="PRO") {legMatch=oSeq.legitPRO} 
	for (let i=0;i<s.length;i++) {
		if ((s[i].match(legMatch))==null) {
			s2+="X";
		} else {
			s2+=s[i];
		}
	}
	return s2;
}

oSeq.makeTitresUniques = function (tSeq) {
	let l=tSeq.length;
	for (let i=l-1;i>=0;i--) {
		let s=tSeq[i];
		let n=2;
		let titreOri=s.titre;
		while (tSeq.filter(c=>c.titre==s.titre).length>1) {
			s.titre=titreOri.substring(0,oSeq.nbMaxCarTitre-4)+"("+n+")";
			n++;
		}
	}
}


oSeq.genere2Sequences = function (n) {
	oSeqNa.tSeq[0].seq=oSeq.genereSequenceNucleo(n);
	oSeqNa.tSeq[1].seq=oSeq.genereSequenceNucleo(n);
}

oSeq.genereSequenceNucleo = function (n) {
	let tN=['A','T','C','G'];
	let s="";
	for (let i=0;i<n;i++) {
		s+=tN[Math.floor(Math.random()*4)];
	}
	return s;
}


oSeq.ctxBlast = function () {
	oMenu.exitMenu();
	let id=oSeq.ctxId;
	let nId=oSeq.ctxNId;
	if (id!=0)  {return false}
	let selSeq=oSeqNa.tSeq[nId];
	let seq=selSeq.seq;
	seq=seq.replace(/Î¨/g,"U");
	seq=seq.toLowerCase();
	if (seq.length>oSeq.blastMaxL) {
		seq=seq.substr(0,oSeq.blastMaxL);
	}
	let progr="blastn";
	if (selSeq.type=="PRO") {
		progr="blastp";
	}
	let url="https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM="+progr+"&PAGE_TYPE=BlastSearch&QUERY="+seq;
	if (oDem.inElectron) {
		require('electron').shell.openExternal(url);
	} else {
		window.open(url, '_blank');
	}
}

oSeq.dblClick = function (ooSeq,e) {
	if (e.cancelable) {e.preventDefault();}
	setCurseurRougeTo (ooSeq,-1);
	let canv=ooSeq.canv;
	let x=e.clientX-canv.getBoundingClientRect().left;
	let y=e.clientY-canv.getBoundingClientRect().top;	
	oSeq.doDblClick(ooSeq,x,y,);
}

oSeq.doDblClick = function (ooSeq,x,y) {
	hide (divPos);
	hide(divCtxMenu);
	hide(divCtxMenu2);
	if (ooSeq.id!=0) {return false} // oSeqNa seulement pour l'instant
	let xx=x*pixelRatio;
	let yy=y*pixelRatio;
	let canv=ooSeq.canv;
	let overSeq=oSeq.isOverSequence (ooSeq,xx);
	if (!overSeq) {return false}
	let ns=Math.floor(yy*ooSeq.tSeq.length/ooSeq.canv.height);
	if ((ns<0)||(ns>=oSeqNa.tSeq.length)) {return false}
	xx-=ooSeq.x0seq;
	let xCar=xx/oSeq.exFont;
	let seq=ooSeq.tSeq[ns];
	let posMax=seq.seq.length;
	if (posMax>oSeq.maxNbResEditable) {
		avert({titre:"Avertissement",texte:"La sÃ©quence est trop longue pour pouvoir Ãªtre modifiÃ©e."});
		return false;
	}
	let nPos;
	let dec=seq.dec;
	if (!oSeq.decal) {dec=0}
	if (seq.type=="PRO") {
		dec=dec/3;
		if ((!oSeq.queProt)||(oSeq.codeAA3)) {
			nPos=Math.floor(ooSeq.i0Seq+xCar);
			nPos=Math.floor(nPos/3-dec);
		} else {
			nPos=Math.floor(ooSeq.i0Seq+xCar-dec);
		}
	} else {
		nPos=Math.floor(ooSeq.i0Seq+xCar-dec);
	}
	
	if (nPos>=posMax) {return false}
	let res=seq.seq[nPos];
	oSeq.ctxNId=ns;
	oSeq.ctxId=ooSeq.id;
	show(divPanneauModifSeq);
	inputTextSequenceModif.value=seq.seq;
	inputTextSequenceModif.focus();
	// astuce pour scroller au bon endroit de la sÃ©quence
	let fullText = inputTextSequenceModif.value;
	inputTextSequenceModif.value = fullText.substring(0, nPos+1);
	inputTextSequenceModif.scrollTop = inputTextSequenceModif.scrollHeight;
	inputTextSequenceModif.value = fullText;
	inputTextSequenceModif.setSelectionRange(nPos,nPos+1);
	//console.log ("dbl clic",xCar,nPos,res);
}



