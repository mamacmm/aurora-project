(function(aC){var aD=document,a4=aD.documentElement,ai=Ext.each,ak=Ext.isEmpty,L=false,ag=true,az=null,a0=aC.CheckBox,ah="_",k="__",w=".",r=" ",x="",E="]",aA="-c",ap="-u",aL="$l-",aF="$u-",aM="on",ao="px",a1="tr",a="td",a6="th",b="_tb",ar="div",n="top",c="left",am="none",T="width",O="center",av="hidden",aP="cursor",aq="visible",aB="default",aa="w-resize",g="outline",aQ="1px dotted blue",aR="atype",e="append",aK="insertBefore",aW="insertAfter",f="before",l="_navbar",aY="text-overflow",D="recordid",R="dataindex",ad="row-selected",Q="required",aH="item-notBlank",au="item-invalid",d="row-alt",F="grid-rowbox",aU=w+F,u="grid.rowcheck",B="grid.rowradio",G="grid.head",a2="grid-ckb ",af="grid-select-all",al="multiple",ax="checkedvalue",y="-readonly",I="item-ckb",X=I+"-self",a3=w+X,aE=I+ap,aN=I+aA,N=I+y+ap,W=I+y+aA,Y="item-radio-img",aV=Y+aA,aJ=Y+ap,S=Y+y+aA,H=Y+y+ap,aZ=a3+r+w+aN,q="grid-cell",h="cell-editor",M="cellcheck",Z="rowcheck",ab="rowradio",at="rownumber",j="grid-",a8=j+at,aO="desc",o="asc",i=j+aO,aG=j+o,p="click",a5="dblclick",K="cellclick",v="render",aX="rowclick",aw="editorshow",V="nexteditorshow",aS="keydown",an="select",z="mousedown",ay="mousemove",aj="mouseup",t="createrow",J="addrow",ac="未找到",aI="方法!",P="tr[class!=grid-hl]",s="div[atype=grid.headcheck]",aT="["+R+"=",a7=a6+aT,ae=a+aT,m={autoadjust:ag,forexport:ag,hidden:L,lock:L,resizable:ag,rowspan:1,sortable:ag,width:100};aC.Grid=Ext.extend(aC.Component,{constructor:function(A){var C=this;C.selectedId=az;C.lockWidth=0;C.autofocus=ag;aC.Grid.superclass.constructor.call(C,A);aC.onReady(function(){C.autofocus&&C.focus()})},initComponent:function(A){aC.Grid.superclass.initComponent.call(this,A);var U=this,C=U.wrap,a9=U.wb=Ext.get(U.id+"_wrap");U.fb=a9.child("div[atype=grid.fb]");if(U.fb){U.uf=U.fb.child("div[atype=grid.uf]")}U.uc=C.child("div[atype=grid.uc]");U.uh=C.child("div[atype=grid.uh]");U.ub=C.child("div[atype=grid.ub]");U.uht=C.child("table[atype=grid.uht]");U.lc=C.child("div[atype=grid.lc]");U.lh=C.child("div[atype=grid.lh]");U.lb=C.child("div[atype=grid.lb]");U.lht=C.child("table[atype=grid.lht]");U.sp=C.child("div[atype=grid.spliter]");Ext.getBody().insertFirst(U.sp);U.classfiyColumns();U.initTemplate()},processListener:function(A){var C=this;aC.Grid.superclass.processListener.call(C,A);C.wrap[A]("mouseover",C.onMouseOver,C)[A]("mouseout",C.onMouseOut,C)[A]("focus",C.onFocus,C)[A]("blur",C.onBlur,C);if(C.canwheel!==L){C.wb[A]("mousewheel",C.onMouseWheel,C)}C.wb[A](Ext.isOpera?"keypress":aS,C.handleKeyDown,C)[A]("keyup",C.handleKeyUp,C);C.ub[A]("scroll",C.syncScroll,C)[A](p,C.onClick,C)[A](a5,C.onDblclick,C);C.uht[A](ay,C.onUnLockHeadMove,C);C.uh[A](z,C.onHeadMouseDown,C)[A](p,C.onHeadClick,C);if(C.lb){C.lb[A](p,C.onClick,C)[A](a5,C.onDblclick,C)}if(C.lht){C.lht[A](ay,C.onLockHeadMove,C)}if(C.lh){C.lh[A](z,C.onHeadMouseDown,C)[A](p,C.onHeadClick,C)}C[A](K,C.onCellClick,C)},initEvents:function(){aC.Grid.superclass.initEvents.call(this);this.addEvents(v,aS,a5,K,aX,aw,V),t},syncScroll:function(){var A=this;A.hideEditor();A.uh.dom.scrollLeft=A.ub.dom.scrollLeft;if(A.lb){A.lb.dom.scrollTop=A.ub.dom.scrollTop}if(A.uf){A.uf.dom.scrollLeft=A.ub.dom.scrollLeft}},handleKeyUp:function(A){if(A.getKey()==9){this.showEditorByRecord()}},handleKeyDown:function(a9){var C=this,A=a9.getKey(),U=C.dataset;if(a9.ctrlKey&&a9.keyCode==86&&C.canpaste){var ba=window.clipboardData.getData("text");if(ba){ai(ba.split("\n"),function(be){var bc=be.split("\t");if(bc==x){return}var bd={},bb=0;ai(C.columns,function(bf){if(C.isFunctionCol(bf.type)){return}if(bf.hidden!==ag){bd[bf.name]=bc[bb];bb++}});U.create(bd)})}}else{if(A==9){C.showEditorByRecord()}else{if(A==38||A==40||A==33||A==34){if(U.loading==ag){return}switch(a9.getKey()){case 33:U.prePage();break;case 34:U.nextPage();break;case 38:if(!a9.ctrlKey){U.pre()}break;case 40:if(!a9.ctrlKey){U.next()}break}a9.stopEvent()}}}C.fireEvent(aS,C,a9)},processDataSetLiestener:function(A){var C=this,U=C.dataset;if(U){U[A]("ajaxfailed",C.onAjaxFailed,C);U[A]("metachange",C.onRefresh,C);U[A]("update",C.onUpdate,C);U[A]("reject",C.onUpdate,C);U[A]("add",C.onAdd,C);U[A]("submit",C.onBeforSubmit,C);U[A]("submitfailed",C.onAfterSuccess,C);U[A]("submitsuccess",C.onAfterSuccess,C);U[A]("query",C.onBeforeLoad,C);U[A]("load",C.onLoad,C);U[A]("loadfailed",C.onAjaxFailed,C);U[A]("valid",C.onValid,C);U[A]("beforeremove",C.onBeforeRemove,C);U[A]("remove",C.onRemove,C);U[A]("clear",C.onLoad,C);U[A]("refresh",C.onRefresh,C);U[A]("fieldchange",C.onFieldChange,C);U[A]("indexchange",C.onIndexChange,C);U[A]("select",C.onSelect,C);U[A]("unselect",C.onUnSelect,C);U[A]("selectall",C.onSelectAll,C);U[A]("unselectall",C.onUnSelectAll,C)}},bind:function(C){if(Ext.isString(C)){C=$(C);if(!C){return}}var A=this;A.dataset=C;if(C.autopagesize===ag){C.pagesize=Math.round(((A.ub.getHeight()||parseFloat(A.ub.dom.style.height))-16)/25)}A.processDataSetLiestener(aM);$A.onReady(function(){A.onLoad()})},initTemplate:function(){var A=this;A.rowTdTpl=new Ext.Template(["<td {rowSpan} ",aR,'="{',aR,'}" class="',F,'" ',D,'="{',D,'}">']);A.rowNumTdTpl=new Ext.Template(['<td {rowSpan} style="text-align:{align}" class="',a8,'" ',aR,'="',a8,'" ',D,'="{',D,'}">']);A.rowNumCellTpl=new Ext.Template(['<div style="',T,":{",T,'}px">{text}</div>']);A.tdTpl=new Ext.Template(['<td {rowSpan} style="visibility:{visibility};text-align:{align}" ',R,'="{name}" ',aR,'="',q,'" ',D,'="{',D,'}">']);A.cellTpl=new Ext.Template(['<div class="',q,' {cellcls}" style="',T,":{",T,'}px" id="',A.id,'_{name}_{recordid}" title="{title}"><span>{text}</span></div>']);A.cbTpl=new Ext.Template(['<center><div class="{cellcls}" id="',A.id,"_{name}_{",D,'}"></div></center>'])},getCheckBoxStatus:function(A,a9,U){var bb=this.dataset.getField(a9),C=bb.getPropertity(ax),ba=A.data[a9];return I+(U?y:x)+((ba&&ba==C)?aA:ap)},createTemplateData:function(C,A){return{width:C.width-2,recordid:A.id,visibility:C.hidden===ag?av:aq,name:C.name}},createCell:function(C,bc,be,bh){var bf=this,ba=bf.createTemplateData(C,bc),bk,a9=bf.tdTpl,bm=x,U=C.type,bb,bd=bf.getEditor(C,bc),bi=[];if(bd!=x){var bg=aC.CmpManager.get(bd);if(bg&&(bg instanceof a0)){U=M}else{bm=h}}else{if(C.name&&!ak(bc.getField(C.name).get(ax))){U=M;bb=ag}}if(U==Z||U==ab){bb=bf.dataset.execSelectFunction(bc)?x:y;a9=bf.rowTdTpl;ba=Ext.apply(ba,{align:O,atype:U==Z?u:B,cellcls:U==Z?a2+I+bb+ap:"grid-radio "+Y+bb+ap});bk=bf.cbTpl}else{if(U==M){ba=Ext.apply(ba,{align:O,cellcls:a2+bf.getCheckBoxStatus(bc,C.name,bb)});bk=bf.cbTpl}else{var bj=bc.getMeta().getField(C.name);if(bj&&ak(bc.data[C.name])&&bc.isNew==ag&&bj.get(Q)==ag){bm=bm+r+aH}var A=(bm.indexOf(h)!=-1)?5:2,bl=bf.renderText(bc,C,bc.data[C.name]);ba=Ext.apply(ba,{align:C.align||c,cellcls:bm,width:ba.width-A,text:bl,title:String(bl).replace(/<[^<>]*>/mg,x)});bk=bf.cellTpl;if(U==at){a9=bf.rowNumTdTpl;bk=bf.rowNumCellTpl}}}if(bh){ba.rowSpan="rowSpan="+bh}if(be){bi.push(a9.applyTemplate(ba))}bi.push(bk.applyTemplate(ba));if(be){bi.push("</td>")}return bi.join(x)},createRow:function(bb,bg,be,bf){var ba=this,U={},bc=az,bh=L,a9=ba.parseCss(ba.renderRow(bf,bg));ba.fireEvent(t,ba,bg,bf,U,be);if(U.height){a9.style=a9.style=";height:"+U.height+"px;"}var bd=['<tr id="',ba.id,bb,bf.id,'" class="',(bg%2==0?x:d),a9.cls,'"','style="',a9.style,'">'];for(var C=0,A=be.length;C<A;C++){if(be[C].hidden){continue}if(U.name&&!U.height&&!bh){bc=az;if(be[C].name==U.name){bh=ag}else{bc=2}}bd.push(ba.createCell(be[C],bf,ag,bc))}bd.push("</tr>");bd.push(U.html||"");return bd.join(x)},parseCss:function(U){var ba=x,A=x;if(Ext.isArray(U)){for(var C=0;C<U.length;C++){var a9=this.parseCss(U[C]);ba+=";"+a9.style;A+=r+a9.cls}}else{if(Ext.isString(U)){var bb=!!U.match(/^([^,:;]+:[^:;]+;)*[^,:;]+:[^:;]+;*$/);A=bb?x:U;ba=bb?U:x}}return{style:ba,cls:A}},renderText:function(A,C,ba){var a9=C.renderer,ba=$A.escapeHtml(ba);if(a9){var U=aC.getRenderer(a9);if(U==az){alert(ac+a9+aI);return ba}ba=U(ba,A,C.name);return ba==az?x:ba}return ba==az?x:ba},renderRow:function(A,ba){var a9=this.rowrenderer,C=az;if(a9){var U=aC.getRenderer(a9);if(U==az){alert(ac+a9+aI);return C}C=U(A,ba);return !C?x:C}return C},createTH:function(U){var ba=['<tr class="grid-hl">'];for(var C=0,A=U.length;C<A;C++){var a9=U[C];if(a9.hidden){continue}ba.push("<th ",R,'="',a9.name,'" style="height:0px;width:',a9.width,ao,'"></th>')}ba.push("</tr>");return ba.join(x)},onBeforeRemove:function(){aC.Masker.mask(this.wb,_lang["grid.mask.remove"])},onBeforeLoad:function(){this.ub.scrollTo(c,0);this.uh.scrollTo(c,0);if(!Ext.isIE6){aC.Masker.mask(this.wb,_lang["grid.mask.loading"])}},onBeforSubmit:function(A){aC.Masker.mask(this.wb,_lang["grid.mask.submit"])},onAfterSuccess:function(){aC.Masker.unmask(this.wb)},preLoad:function(){},onLoad:function(){var C=this;C.isSelectAll=L;C.clearDomRef();C.preLoad();var A=C.wrap.removeClass(af).child(s);if(A&&C.selectable&&C.selectionmodel==al){C.setCheckBoxStatus(A,L)}if(C.lb){C.renderLockArea()}C.renderUnLockAread();C.drawFootBar();aC.Masker.unmask(C.wb);C.fireEvent(v,C)},clearDomRef:function(){this.selectlockTr=az;this.selectUnlockTr=az},customize:function(){var bc=location.pathname,bd=bc.indexOf("modules"),a9=bc.substring(bd,bc.length),U=a9.substring(a9.lastIndexOf("/")+1,a9.length),C=bc.substring(0,bd),bb=this.wrap.parent("[url]");if(bb){var ba=bb.getAttributeNS("","url");if(ba){ba=ba.split("?")[0];if(ba.indexOf(C)==-1){var A=ba.lastIndexOf("/");if(A!=-1){ba=ba.substring(A+1,ba.length)}a9=a9.replaceAll(U,ba)}else{a9=ba.substring(ba.indexOf(C)+new String(C).length,ba.length)}}}new Aurora.Window({id:"sys_customization_grid",url:C+"modules/sys/sys_customization_grid.screen?source_file="+a9+"&id="+this.id+"&did="+this.dataset.id,title:"个性化设置",height:530,width:560})},onAjaxFailed:function(C,A){aC.Masker.unmask(this.wb)},onMouseWheel:function(C){C.stopEvent();if(this.editing==ag){return}var U=C.getWheelDelta(),A=this.dataset;if(U>0){A.pre()}else{if(U<0){A.next()}}},focus:function(){this.wb.focus()},onFocus:function(){this.hasFocus=ag},blur:function(){this.wb.blur()},onBlur:function(){this.hasFocus=L},renderLockArea:function(){var A=this,C=A.lockColumns,U=['<TABLE cellSpacing="0" atype="grid.lbt" cellPadding="0" border="0"  ',T,'="',A.lockWidth,'"><TBODY>',A.createTH(C)];ai(A.dataset.data,function(ba,a9){U.push(A.createRow(aL,a9,C,ba))},A);U.push('</TBODY></TABLE><DIV style="height:17px"></DIV>');A.lbt=A.lb.update(U.join(x)).child("table[atype=grid.lbt]")},renderUnLockAread:function(){var A=this,C=A.unlockColumns,U=['<TABLE cellSpacing="0" atype="grid.ubt" cellPadding="0" border="0" ',T,'="',A.unlockWidth,'"><TBODY>',A.createTH(C)];ai(A.dataset.data,function(ba,a9){U.push(A.createRow(aF,a9,C,ba))},A);U.push("</TBODY></TABLE>");A.ubt=A.ub.update(U.join(x)).child("table[atype=grid.ubt]")},isOverSplitLine:function(A){var U=this,C=0,a9=L;U.overColIndex=-1;ai(U.columns,function(bb,ba){if(bb.hidden!==ag){C+=bb.width}if(A<C+3&&A>C-3&&bb.resizable!=L){a9=ag;U.overColIndex=ba;return L}});return a9},onRefresh:function(){var A=this;A.onLoad();if(A.selectable){var C=A.dataset;ai(C.selected,function(U){A.onSelect(C,U)})}},onIndexChange:function(U,C){var A=this.getDataIndex(C.id);if(A==-1){return}this.selectRow(A,L)},isFunctionCol:function(A){return A==Z||A==ab||A==at},onAdd:function(U,bc,bl){var bf=this,ba=bf.columns,bj=bl===U.data.length-1,bd=bf.parseCss(bf.renderRow(bc,bl)),bk=(bl%2==0?x:d+r)+bd.cls;if(bf.lbt){var C=aD.createElement(a1),bi=bf.lbt.dom.tBodies[0];C.id=bf.id+aL+bc.id;C.className=bk;Ext.fly(C).set({style:bd.style});ai(ba,function(bm){if(bm.lock===ag){if(bm.hidden){return ag}var bo=aD.createElement(a);if(bm.type==Z){Ext.fly(bo).set({recordid:bc.id,atype:u});bo.className=F;if(bf.isSelectAll){bo.className+=r+X}}else{if(bm.type==ab){Ext.fly(bo).set({recordid:bc.id,atype:B});bo.className=F}else{if(bm.hidden){bo.style.visibility=av}bo.style.textAlign=bm.align||c;if(!bf.isFunctionCol(bm.type)){bo.dataindex=bm.name}var bn={recordid:bc.id,atype:q};if(bm.type==at){bo.className=a8;bn.atype=a8}Ext.fly(bo).set(bn)}}bo.innerHTML=bf.createCell(bm,bc,L);C.appendChild(bo)}});if(bj){bi.appendChild(C)}else{var be=Ext.fly(bi).query(P);for(var bb=bl,a9=be.length;bb<a9;bb++){var bg=Ext.fly(be[bb]).toggleClass(d);bg.select(".grid-rownumber div").each(function(bm){bm.update(Number(bm.dom.innerHTML)+1)});bg.select(aU).each(function(bm){bf.setSelectStatus(U.findById(bm.getAttributeNS(x,D)))})}bi.insertBefore(C,be[bl])}}var A=aD.createElement(a1),bh=bf.ubt.dom.tBodies[0];A.id=bf.id+aF+bc.id;A.className=bk;Ext.fly(A).set({style:bd.style});ai(ba,function(bm){if(bm.lock!==ag){if(bm.hidden){return ag}var bn=aD.createElement(a);bn.style.visibility=bm.hidden===ag?av:aq;bn.style.textAlign=bm.align||c;Ext.fly(bn).set({dataindex:bm.name,recordid:bc.id,atype:q});bn.innerHTML=bf.createCell(bm,bc,L);A.appendChild(bn)}});if(bj){bh.appendChild(A)}else{var be=Ext.fly(bh).query(P);for(var bb=bl,a9=be.length;bb<a9;bb++){Ext.fly(be[bb]).toggleClass(d)}bh.insertBefore(A,be[bl])}bf.setSelectStatus(bc);bf.drawFootBar();bf.fireEvent(J,bf,bc)},renderEditor:function(a9,A,U,C){a9.parent(a).update(this.createCell(U,A,L))},onUpdate:function(U,a9,C,be){var bb=this,A,bd,bf;bb.setSelectStatus(a9);if(A=Ext.get([bb.id,C,a9.id].join(ah))){var bc=bb.findColByName(C),ba=bb.getEditor(bc,a9);if(ba!=x&&($(ba) instanceof a0)){bb.renderEditor(A,a9,bc,ba)}else{A.update(bf=bb.renderText(a9,bc,be)).set({title:$A.unescapeHtml(bf)})}}ai(bb.columns,function(bg){if(bg.name!=C&&(bd=Ext.get([bb.id,bg.name,a9.id].join(ah)))){if(bg.editorfunction){bb.renderEditor(bd,a9,bg,bb.getEditor(bg,a9))}if(bg.renderer){bd.update(bf=bb.renderText(a9,bg,a9.get(bg.name))).set({title:bf})}}});bb.drawFootBar(C)},onValid:function(a9,A,C,U){var bb=this.findColByName(C);if(bb){var ba=Ext.get([this.id,C,A.id].join(ah));if(ba){if(U==L){ba.addClass(au)}else{ba.removeClass([aH,au])}}}},onRemove:function(ba,A,C){var a9=this,U=Ext.get(a9.id+aL+A.id),bb=Ext.get(a9.id+aF+A.id);if(U){U.remove()}if(bb){bb.remove()}ai(a9.columns,function(bc){if(bc.name){a9.removeCompositeEditor(bc.name,A)}});if(Ext.isIE||Ext.isIE9){a9.syncScroll()}a9.clearDomRef();aC.Masker.unmask(a9.wb);a9.drawFootBar()},onClear:function(){},onFieldChange:function(a9,A,ba,C,U){if(C==Q){var bb=Ext.get([this.id,ba.name,A.id].join(ah));if(bb){bb[U==ag?"addClass":"removeClass"](aH)}}},getDataIndex:function(U){for(var C=0,a9=this.dataset.data,A=a9.length;C<A;C++){if(a9[C].id==U){return C}}return -1},onSelect:function(a9,C,ba){if(!C||ba){return}var U=this,A=Ext.get(U.id+k+C.id);A.parent(aU).addClass(X);if(A){if(U.selectionmodel==al){U.setCheckBoxStatus(A,ag)}else{U.setRadioStatus(A,ag);a9.locate((a9.currentPage-1)*a9.pagesize+a9.indexOf(C)+1)}U.setSelectStatus(C)}},onUnSelect:function(a9,C,ba){if(!C||ba){return}var U=this,A=Ext.get(U.id+k+C.id);A.parent(aU).addClass(X);if(A){if(U.selectionmodel==al){U.setCheckBoxStatus(A,L)}else{U.setRadioStatus(A,L)}U.setSelectStatus(C)}},onSelectAll:function(){var A=this;A.clearChecked();A.isSelectAll=ag;A.isUnSelectAll=L;A.wrap.addClass(af)},onUnSelectAll:function(){var A=this;A.clearChecked();A.isSelectAll=L;A.isUnSelectAll=ag;A.wrap.removeClass(af)},clearChecked:function(){var A=this.wrap;A.select(aZ).replaceClass(aN,aE);A.select(a3).removeClass(X)},onDblclick:function(ba,C){if(C=Ext.fly(C).parent("td[atype=grid-cell]")){var U=this,a9=U.dataset,A=a9.findById(C.getAttributeNS(x,D));U.fireEvent(a5,U,A,a9.indexOf(A),C.getAttributeNS(x,R))}},onClick:function(bc,bf){var bd=(bf=Ext.fly(bf)).parent(a);if(bd){var bb=this,U=bd.getAttributeNS(x,aR),be=bd.getAttributeNS(x,D),C=bb.dataset;if(U==q){var ba=C.findById(be),bg=C.indexOf(ba),A=bd.getAttributeNS(x,R);bb.fireEvent(K,bb,bg,A,ba,!bf.hasClass("grid-ckb"));bb.fireEvent(aX,bb,bg,ba)}else{if(U==a8){var ba=C.findById(be),bg=C.indexOf(ba);if(ba.id!=bb.selectedId){bb.selectRow(bg)}}else{if(U==u){var a9=Ext.get(bb.id+k+be);if(a9.hasClass(N)||a9.hasClass(W)){return}if(bb.isSelectAll&&!a9.parent(a3)){a9.replaceClass(aE,aN)}else{if(bb.isUnselectAll&&!a9.parent(a3)){a9.replaceClass(aN,aE)}}a9.hasClass(aN)?C.unSelect(be):C.select(be)}else{if(U==B){var a9=Ext.get(bb.id+k+be);if(a9.hasClass(H)||a9.hasClass(S)){return}C.select(be)}}}}}},onCellClick:function(U,a9,C,A,ba){this.adjustColumn(C);this.showEditor(a9,C,ba)},adjustColumn:function(a9){var bc=this,U=bc.findColByName(a9);if(!U||!U.autoadjust||U.hidden){return}var bb=bc.wrap.select("tr.grid-hl "+a7+a9+E),C=parseInt(bb.elements[0].style.width),A=C,bd=12,ba=Math.min(bc.width-(bc.selectable?23:0)-20,U.maxadjustwidth||Number.MAX_VALUE);bc.wrap.select(ae+a9+"] span").each(function(be){if(Ext.isIE||Ext.isIE9){be.parent().setStyle(aY,"clip")}A=Math.max(be.getWidth()+bd,A);if(Ext.isIE||Ext.isIE9){be.parent().setStyle(aY,x)}if(A>ba){A=ba;return L}});A>C&&bc.setColumnSize(a9,A)},setColumnPrompt:function(C,A){this.wrap.select("td.grid-hc"+aT+C+"] div").update(A)},setEditor:function(C,U){var A=this.findColByName(C),a9=Ext.get([this.id,C,this.selectedId].join(ah));A.editor=U;if(a9){if(U==x){a9.removeClass(h)}else{if(!$(U) instanceof a0){a9.addClass(h)}}}},getEditor:function(a9,C){var U=a9.editor||x;if(a9.editorfunction){var A=window[a9.editorfunction];if(A==az){alert(ac+a9.editorfunction+aI);return az}U=A(C,a9.name)||x}return U},showEditor:function(be,A,bd){if(be==-1){return}var bb=this,U=bb.findColByName(A);if(!U){return}var C=bb.dataset,a9=C.getAt(be);if(!a9){return}if(a9.id!=bb.selectedId){bb.selectRow(be)}else{bb.focusRow(be)}bb.focusColumn(A);var bc=bb.getEditor(U,a9);bb.setEditor(A,bc);if(bc!=x){var ba=$(bc);(function(){var bg=a9.get(A),bj=Ext.get([bb.id,A,a9.id].join(ah)),bi=bj.getXY(),bf;ba.bind(C,A);ba.render(a9);ba.el.on(aS,bb.onEditorKeyDown,bb);Ext.fly(a4).on(z,bb.onEditorBlur,bb);bf=bb.currentEditor={record:a9,ov:bg,name:A,editor:ba};if(ba instanceof a0){ba.move(bi[0],bi[1]-4);if(bd){ba.focus()}else{ba.onClick()}}else{var bh=bj.parent();if(ba instanceof aC.Field){ba.el.setStyle("text-align",U.align||c)}ba.move(bi[0],bi[1]);ba.setHeight(bj.getHeight()-2);ba.setWidth(bj.getWidth()-5);ba.isEditor=ag;ba.isFireEvent=ag;ba.isHidden=L;ba.focus();bb.editing=ag;ba.on(an,bb.onEditorSelect,bb);if(Ext.isFunction(bd)){bd(ba)}bb.fireEvent(aw,bb,ba,be,A,a9)}}).defer(10)}},showEditorByRecord:function(A){var C=this,U=C.dataset,a9=A?U.indexOf(A):0;A=A||U.getAt(0);ai(C.columns,function(ba){if(ba.hidden!=ag&&C.getEditor(ba,A)!=x){C.fireEvent(K,C,a9,ba.name,A,function(){});C.fireEvent(aX,C,a9,A);return L}})},onEditorSelect:function(){(function(){this.hideEditor()}).defer(1,this)},onEditorKeyDown:function(ba){var U=this,a9=ba.keyCode,C=U.currentEditor;if(a9==27){if(C){var A=C.editor;if(A){A.clearInvalid();A.render(A.binder.ds.getCurrentRecord())}}U.hideEditor()}else{if(a9==13){if(!(C&&C.editor&&C.editor instanceof aC.TextArea)){U.showEditorBy(39)}}else{if(a9==9){ba.stopEvent();U.showEditorBy(ba.shiftKey?37:39)}else{if(ba.ctrlKey&&(a9==37||a9==38||a9==39||a9==40)){U.showEditorBy(a9);ba.stopEvent()}}}}},findEditorBy:function(bc){var bf=this,C,be;if((C=bf.currentEditor)&&(be=C.editor)){var bi=bf.columns,bg=L,bb=bf.dataset,ba=be.binder.name,A=be.record,bk=bb.data.indexOf(A),U=az,bh=L,bd=ag,bj=L,a9;if(bk!=-1){if(bc==37||bc==38){bi=[].concat(bi).reverse();bd=L}if(bc==38||bc==40){bj=ag;a9=bf.findColByName(ba)}while(A){if(!bj){ai(bi,function(bl){if(bg){if(bl.hidden!=ag&&bf.getEditor(bl,A)!=x){U=bl.name;return L}}else{if(bl.name==ba){bg=ag}}})}if(U){return{row:bk,name:U,record:A}}A=bb.getAt(bd?++bk:--bk);if(bd&&!A&&!bh&&bf.autoappend!==L){bf.hideEditor();bb.create();A=bb.getAt(bk);bh=ag}if(bj&&A&&bf.getEditor(a9,A)!=x){U=ba}}}}return az},showEditorBy:function(U){var a9=this,bb=true,C=a9.findEditorBy(U);if(C){a9.hideEditor();var ba=C.row,A=C.record;a9.fireEvent(K,a9,ba,C.name,A,bb);a9.fireEvent(aX,a9,ba,A)}},focusRow:function(bb){var ba=25,A=this.ub,U=A.getScroll().top,a9=A.getHeight(),C=A.dom.scrollWidth>A.dom.clientWidth?16:0;if(bb*ba<U){A.scrollTo(n,bb*ba-1)}else{if((bb+1)*ba>(U+a9-C)){A.scrollTo(n,(bb+1)*ba-a9+C)}}},focusColumn:function(U){var bd=this,A=25,C=bd.ub,ba=C.getScroll().left,be=0,bc=0,a9=0,bb;ai(bd.columns,function(bf){if(bf.name==U){bc=bf.width}if(bf.hidden!==ag){if(bf.lock===ag){a9+=bf.width}else{if(bc==0){be+=bf.width}}}});bb=be+bc;if(be<ba){C.scrollTo(c,be)}else{if((bb-ba)>(bd.width-a9)){C.scrollTo(c,bb-bd.width+a9+(C.dom.scrollHeight>C.dom.clientHeight?16:0))}}},hideEditor:function(){var a9=this,U=a9.currentEditor;if(U){var C=U.editor;if(C){if(!C.canHide||C.canHide()){C.el.un(aS,a9.onEditorKeyDown,a9);C.un(an,a9.onEditorSelect,a9);Ext.fly(a4).un(z,a9.onEditorBlur,a9);C.move(-10000,-10000);var A=C.autocompleteview;if(A){A.hide()}C.blur();C.onBlur();C.isFireEvent=L;C.isHidden=ag;a9.editing=L;if(C.collapse){C.collapse()}}}}},onEditorBlur:function(a9,C){var U=this,A=U.currentEditor;if(A&&!A.editor.isEventFromComponent(C)){U.hideEditor.defer(Ext.isIE9?10:0,U)}},onLockHeadMove:function(C){var A=this;A.hmx=C.xy[0]-A.lht.getXY()[0];A.lh.setStyle(aP,A.isOverSplitLine(A.hmx)?aa:aB)},onUnLockHeadMove:function(U){var A=this;var C=A.uht;A.hmx=U.xy[0]-(C?C.getXY()[0]+C.getScroll().left:0)+A.lockWidth;A.uh.setStyle(aP,A.isOverSplitLine(A.hmx)?aa:aB)},onHeadMouseDown:function(C){var A=this;A.dragWidth=-1;if(A.overColIndex==undefined||A.overColIndex==-1){return}A.dragIndex=A.overColIndex;A.dragStart=C.getXY()[0];A.sp.setHeight(A.wrap.getHeight()).show().setStyle({top:A.wrap.getXY()[1]+ao,left:C.xy[0]+ao});Ext.get(a4).on(ay,A.onHeadMouseMove,A).on(aj,A.onHeadMouseUp,A)},onHeadClick:function(bd,bi){var bb=this,be=Ext.fly(bi).parent(a),A=bb.dataset,U;if(be){U=be.getAttributeNS(x,aR)}if(U==G){var bc=be.getAttributeNS(x,R),C=bb.findColByName(bc);if(C&&C.sortable===ag){if(A.isModified()){aC.showInfoMessage("提示","有未保存数据!");return}var bf=be.child(ar),bh=bc,ba=x;if(bb.currentSortTarget){bb.currentSortTarget.removeClass([aG,i])}bb.currentSortTarget=bf;if(ak(C.sorttype)){C.sorttype=aO;bf.removeClass(aG).addClass(i);ba=aO}else{if(C.sorttype==aO){C.sorttype=o;bf.removeClass(i).addClass(aG);ba=o}else{C.sorttype=x;bf.removeClass([i,aG])}}A.sort(bh,ba)}}else{if(U==u){var a9=be.child(s);if(a9){var bg=a9.hasClass(aN);bb.setCheckBoxStatus(a9,!bg);if(!bg){A.selectAll()}else{A.unSelectAll()}}}}},setRadioStatus:function(A,C){if(!C){A.removeClass(aV).addClass(aJ)}else{A.addClass(aV).removeClass(aJ)}},setCheckBoxStatus:function(A,C){if(!C){A.removeClass(aN).addClass(aE)}else{A.addClass(aN).removeClass(aE)}},setSelectDisable:function(U,C){var A=this.dataset.selected.indexOf(C)==-1;if(this.selectionmodel==al){U.removeClass([aN,aE]).addClass(A?N:W)}else{U.removeClass([aV,aJ,S,H]).addClass(A?H:S)}},setSelectEnable:function(U,C){var A=this.dataset.selected.indexOf(C)==-1;if(this.selectionmodel==al){U.removeClass([N,W]).addClass(A?aE:aN)}else{U.removeClass([aJ,aV,H,S]).addClass(A?aJ:aV)}},setSelectStatus:function(C){var U=this,a9=U.dataset;if(a9.selectfunction){var A=Ext.get(U.id+k+C.id);if(!a9.execSelectFunction(C)){U.setSelectDisable(A,C)}else{U.setSelectEnable(A,C)}}},onHeadMouseMove:function(a9){var U=this;a9.stopEvent();U.dragEnd=a9.getXY()[0];var C=U.dragEnd-U.dragStart,ba=U.columns[U.dragIndex],A=ba.width+C;if(A>30&&A<U.width){U.dragWidth=A;U.sp.setStyle(c,a9.xy[0]+ao)}},onHeadMouseUp:function(C){var A=this;Ext.get(a4).un(ay,A.onHeadMouseMove,A).un(aj,A.onHeadMouseUp,A);A.sp.hide();if(A.dragWidth!=-1){A.setColumnSize(A.columns[A.dragIndex].name,A.dragWidth)}A.syncScroll()},findColByName:function(A){var C;if(A){ai(this.columns,function(U){if(U.name&&U.name.toLowerCase()===A.toLowerCase()){C=U;return L}})}return C},selectRow:function(bb,C){var a9=this,ba=a9.dataset,A=ba.getAt(bb),U=(ba.currentPage-1)*ba.pagesize+bb+1;a9.selectedId=A.id;if(a9.selectlockTr){a9.selectlockTr.removeClass(ad)}if(a9.selectUnlockTr){a9.selectUnlockTr.removeClass(ad)}a9.selectUnlockTr=Ext.get(a9.id+aF+A.id);if(a9.selectUnlockTr){a9.selectUnlockTr.addClass(ad)}a9.selectlockTr=Ext.get(a9.id+aL+A.id);if(a9.selectlockTr){a9.selectlockTr.addClass(ad)}a9.focusRow(bb);if(C!==L&&U!=az){ba.locate.defer(5,ba,[U,L])}},setColumnSize:function(A,bf){var ba=this,bb,a9,U=0,C=0;ai(ba.columns,function(bg){if(bg.name&&bg.name===A){if(bg.hidden===ag){return}bg.width=bf;if(bg.lock!==ag){bb=ba.uh.child(a7+A+E);a9=ba.ub.child(a7+A+E)}else{if(ba.lh){bb=ba.lh.child(a7+A+E)}if(ba.lb){a9=ba.lb.child(a7+A+E)}}}if(bg.hidden!==ag){bg.lock!==ag?(C+=bg.width):(U+=bg.width)}});ba.wrap.select(ae+A+"] DIV.grid-cell").each(function(bg){bg.setStyle(T,Math.max(bf-(bg.hasClass(h)?7:4),0)+ao)});ba.unlockWidth=C;ba.lockWidth=U;if(bb){bb.setStyle(T,bf+ao)}if(a9){a9.setStyle(T,bf+ao);a9.setStyle("display",bf==0?"none":"")}var be=Math.max(ba.width-U,0);if(ba.fb){ba.fb.child(a7+A+E).setStyle(T,bf+ao);ba.uf.setStyle(T,be+ao);ba.fb.child("table[atype=fb.ubt]").setStyle(T,C+ao);var bd=ba.fb.child("table[atype=fb.lbt]");if(bd){ba.fb.child("div[atype=grid.lf]").setStyle(T,(U-1)+ao);bd.setStyle(T,U+ao)}}if(ba.lc){var bc=Math.max(U-1,0);ba.lc.setStyle({width:bc+ao,display:bc==0?am:x})}if(ba.lht){ba.lht.setStyle(T,U+ao)}if(ba.lbt){ba.lbt.setStyle(T,U+ao)}ba.uc.setStyle(T,be+ao);ba.uh.setStyle(T,be+ao);ba.ub.setStyle(T,be+ao);ba.uht.setStyle(T,C+ao);if(ba.ubt){ba.ubt.setStyle(T,C+ao)}ba.syncSize()},drawFootBar:function(C){var A=this;if(!A.fb){return}ai([].concat(C?C:A.columns),function(bc){var ba=Ext.isString(bc)?A.findColByName(bc):bc;if(ba&&ba.footerrenderer){var bb=aC.getRenderer(ba.footerrenderer);if(bb==az){alert(ac+ba.footerrenderer+aI);return}var a9=ba.name,U=bb(A.dataset.data,a9);if(!ak(U)){A.fb.child(ae+a9+E).update(U)}}})},syncSize:function(){var A=this,U=0;ai(A.columns,function(a9){if(a9.hidden!==ag){if(a9.lock===ag){U+=a9.width}}});if(U!=0){var C=A.width-U;A.uc.setWidth(C);A.uh.setWidth(C);A.ub.setWidth(C)}},classfiyColumns:function(){var A=this;A.lockColumns=[],A.unlockColumns=[];A.lockWidth=0,A.unlockWidth=0;ai(A.columns,function(C){if(C.lock===ag){A.lockColumns.add(C);if(C.hidden!==ag){A.lockWidth+=C.width}}else{A.unlockColumns.add(C);if(C.hidden!==ag){A.unlockWidth+=C.width}}});A.columns=A.lockColumns.concat(A.unlockColumns)},showColumn:function(C){var A=this.findColByName(C);if(A){if(A.hidden===ag){delete A.hidden;A.forexport=ag;this.setColumnSize(C,A.hiddenwidth||A.width);delete A.hiddenwidth;this.wrap.select(ae+C+E).show()}}},hideColumn:function(C){var A=this.findColByName(C);if(A){if(A.hidden!==ag){A.hiddenwidth=A.width;this.setColumnSize(C,0,L);this.wrap.select(ae+C+E).hide();A.hidden=ag;A.forexport=L}}},removeColumn:function(A){var bd=this,bf=bd.columns,bg=[],bc=[];ai(A,function(bi){col=bd.findColByName(bi);if(!col){return}if(col.lock){bg.push(bi)}else{bc.push(bi)}bf.splice(bf.indexOf(col),1)});var bb=bg.length,ba=bc.length,U=[];if(bb||ba){bd.classfiyColumns();if(bb){var C=bd.lockWidth,bh=bd.wrap.getWidth()-C;for(var a9=0;a9<bb;a9++){U.push(aT+bg[a9]+E)}if(C){bd.lht.setWidth(C);bd.lc.setWidth(C);bd.lbt.dom.width=C}else{bd.lc.remove()}bd.uc.setWidth(bh);bd.uh.setWidth(bh);bd.ub.setWidth(bh)}for(var a9=0;a9<ba;a9++){U.push(aT+bc[a9]+E)}bd.wrap.select(U.join(",")).remove();var be=bd.unlockWidth;bd.uht.setWidth(be);bd.ubt.setWidth(be)}},createHead:Ext.isIE||Ext.isIE9?function(bc,bd,U,bb,C){var A=bb.query(a1),a9=Ext.fly(A[0]).child("th[width=20]"),ba;if(U){ba=bb.query(aT+U+E)[0]}if(bd==aW){ba=ba.nextSibling||az;C++}else{if(bd==e){if(a9){ba=a9.dom}C=-1}}ai(bc,function(bi){var bf=Ext.get(aD.createElement(a6)),bh=Ext.get(A[1].insertCell(C)),be=bi.width,bg=bi.name;if(C>-1){C++}bh.addClass("grid-hc").set({dataindex:bg,atype:G}).update("<div>"+bi.prompt+"</div>");if(ba){A[0].insertBefore(bf.dom,ba)}else{A[0].appendChild(bf.dom)}bf.setStyle(T,be+ao).set({dataindex:bg})})}:function(bc,bd,A,ba){var C=[],a9=[],U=ba.query(bd!=e?aT+A+E:a1);ai(bc,function(be){C.push('<th style="width:',be.width,ao,';" ',R,'="',be.name,'"></th>');a9.push('<td class="grid-hc" atype="grid.head" ',R,'="',be.name,'"><div>',be.prompt,"</div></td>")});new Ext.Template(C.join(x))[bd](U[0],{});new Ext.Template(a9.join(x))[bd](U[1],{});var bb=Ext.fly(U[0]).child("th[width=20]");if(bb){bb.appendTo(Ext.fly(U[0]))}},addColumn:function(bl,C,bb){var bc=this;if(bc.dataset.isModified()){aC.showInfoMessage(_lang["grid.info"],_lang["grid.info.continue"])}else{var bh=bc.columns,bd=bh.length,bk,bi;if(C&&bb){var a9=bc.findColByName(C);if(a9){bk=a9.lock;bi=bc[bk?"lockColumns":"unlockColumns"].indexOf(a9);bd=(bb==f?0:1)+bh.indexOf(a9)}else{alert("未找到列"+C);return}}var bj=[],ba=[];ai(bl,function(bo){var bn=Ext.apply(Ext.apply({},m),bo),bm=bc.findColByName(bn.name);if(bm){return}if(bn.lock){bj.push(bn)}else{ba.push(bn)}});var U=bj.concat(ba);if(U.length){var A=bb?(bb==f?aK:aW):e,bg=umethod=A,be=uname=C,bf=bc.wrap;if(bk){umethod=aK;uname=bc.unlockColumns[0].name}else{bg=e;be=az}bc.columns=bh.slice(0,bd).concat(U).concat(bh.slice(bd));bc.classfiyColumns();if(bj.length){if(!bc.lht){bc.lc=new Ext.Template("<DIV class='grid-la' atype='grid.lc' style='width:24px;'><DIV class='grid-lh' atype='grid.lh' unselectable='on' onselectstart='return false;' style='height:25px;'><TABLE cellSpacing='0' atype='grid.lht' cellPadding='0' border='0' style='width:25px'><TBODY><TR class='grid-hl'></TR><TR height=25></TR></TBODY></TABLE></DIV><DIV class='grid-lb' atype='grid.lb' style='width:100%;height:255px'></DIV></DIV>").insertFirst(bc.wrap.dom,{},ag);bc.lh=bf.child("div[atype=grid.lh]");bc.lb=bf.child("div[atype=grid.lb]");bc.lht=bf.child("table[atype=grid.lht]");bc.lb[aM](p,bc.onClick,bc)[aM](a5,bc.onDblclick,bc);bc.lht[aM](ay,bc.onLockHeadMove,bc);bc.lh[aM](z,bc.onHeadMouseDown,bc)[aM](p,bc.onHeadClick,bc)}bc.createHead(bj,bg,be,bc.lht,bi)}if(ba.length){bc.createHead(ba,umethod,uname,bc.uht,bi)}if(bc.lb){bc.lb.update(x)}bc.ub.update(x);ai(U,function(bm){bc.setColumnSize(bm.name,bm.width)});bc.dataset.query()}}},insertColumnBefore:function(C,A){this.addColumn(A,C,f)},insertColumnAfter:function(C,A){this.addColumn(A,C,1)},setWidth:function(U){var a9=this;if(a9.width==U){return}a9.width=U;a9.wrap.setWidth(U);var C=aC.CmpManager.get(a9.id+b);if(C){C.setWidth(U)}var A=aC.CmpManager.get(a9.id+l);if(A){A.setWidth(U)}if(a9.fb){a9.fb.setWidth(U)}var ba=U-a9.lockWidth;a9.uc.setWidth(ba);a9.uh.setWidth(ba);a9.ub.setWidth(ba);if(a9.uf){a9.uf.setWidth(ba)}},setHeight:function(a9){var ba=this;if(ba.height==a9){return}ba.height=a9;var C=aC.CmpManager.get(ba.id+b);if(C){a9-=25}var A=aC.CmpManager.get(ba.id+l);if(A){a9-=25}if(ba.fb){a9-=25}ba.wrap.setHeight(a9);var U=a9-25;if(ba.lb){ba.lb.setHeight(U)}ba.ub.setHeight(U)},deleteSelectRows:function(U){var C=this.dataset,A=[].concat(C.getSelected());if(A.length>0){C.remove(A)}},remove:function(){var A=this.dataset.getSelected();if(A.length>0){aC.showConfirm(_lang["grid.remove.confirm"],_lang["grid.remove.confirmMsg"],this.deleteSelectRows.createDelegate(this))}},clear:function(){var C=this.dataset,A=C.getSelected();while(A[0]){C.removeLocal(A[0])}},_export:function(C,A,U){this.exportOptions={type:C,filename:A,separator:U};this.showExportConfirm()},showExportConfirm:function(){this.initColumnPrompt();var C=this,ba=0,a9=C.id+"_export",U=['<div class="item-export-wrap" style="margin:15px;width:270px" id="',a9,'">','<div class="grid-uh" atype="grid.uh" style="width: 270px; -moz-user-select: none; text-align: left; height: 25px; cursor: default;" onselectstart="return false;" unselectable="on">','<table cellSpacing="0" cellPadding="0" border="0"><tbody><tr height="25px">','<td class="export-hc" style="width:22px;" atype="export.rowcheck"><center><div atype="export.headcheck" class="',a2,aE,'"></div></center></td>','<td class="export-hc" style="width:222px;" atype="grid-type">',_lang["grid.export.column"],"</td>","</tr></tbody></table></div>",'<div style="overflow:auto;height:200px;"><table cellSpacing="0" cellPadding="0" border="0"><tbody>'],A=ag;ai(C.columns,function(bc,bb){if(!C.isFunctionCol(bc.type)){if(A){A=bc.forexport!==L}U.push("<tr",(ba+bb)%2==0?x:' class="',d,'"','><td class="',F,'" style="width:22px;" ',D,'="',bb,'" atype="export.rowcheck"><center><div id="',C.id,k,bb,'" class="',a2,bc.forexport===L?aE:aN,'"></div></center></td><td><div class="',q,'" style="width:220px">',bc.prompt,bc.hidden?'<div style="float:right;color:red">&lt;隐藏列&gt;</div>':x,"</div></td></tr>")}else{ba++}});if(A){U[7]=aN}U.push("</tbody></table></div></div>");C.exportwindow=aC.showOkCancelWindow(_lang["grid.export.config"],U.join(x),function(bb){aC.showConfirm(_lang["grid.export.confirm"],_lang["grid.export.confirmMsg"],function(bc){C.doExport();bc.close();bb.body.un(p,C.onExportClick,C);bb.close()});return L},az,az,300);C.exportwindow.body.on(p,C.onExportClick,C)},initColumnPrompt:function(){var A=this;if(!A.isPromptInit){ai(A.columns,function(C){if(!A.isFunctionCol(C.type)){C.prompt=C.name?A.wrap.child("td.grid-hc"+aT+C.name+"] div").dom.innerHTML:(C.prompt||A.dataset.getField(C.name).pro.prompt)}});A.isPromptInit=ag}},onExportClick:function(ba,bg){var a9=this,bb=Ext.fly(bg).parent(a);if(bb){var A=bb.getAttributeNS(x,aR);if(A=="export.rowcheck"){var be=bb.getAttributeNS(x,D),C=bb.child(ar),bd=C.hasClass(aN),U=C.getAttributeNS(x,aR),bc=a9.columns;a9.setCheckBoxStatus(C,!bd);if(U=="export.headcheck"){var bf=(a9.isFunctionCol(bc[0].type)?1:0)+(a9.isFunctionCol(bc[1].type)?1:0);a9.exportwindow.body.select("td[atype=export.rowcheck] div[atype!=export.headcheck]").each(function(bh,bj,bi){a9.setCheckBoxStatus(bh,!bd);bc[bi+bf].forexport=!bd})}else{bc[be].forexport=!bd}}}},doExport:function(){var C=this,A=C.exportOptions;C.initColumnPrompt();aC.doExport(C.dataset,C.columns,az,A.type,A.separator,A.filename);delete C.exportOptions},destroy:function(){aC.Grid.superclass.destroy.call(this);this.processDataSetLiestener("un");this.sp.remove();delete this.sp},createCompositeEditor:function(bo,a9,bb,be){var bn=this,bh=bn.id,bg=bn.dataset,bi=bb.id,bc=bn.findColByName(bo),bm=bc.lock,U=Ext.get(bh+(bm?aL:aF)+bi),bf=Ext.get(bh+(bm?aF:aL)+bi),bl=bm?bn.lbt:bn.ubt;if(bn.currentEditor&&bn.currentEditor.editor instanceof a0){bn.hideEditor()}var bk=bl.dom,ba=bk.tBodies[0],bj=document.createElement(a1),bd=document.createElement(a);bj.id=bh+"_cmp_"+bo+ah+bi;bd.colSpan=a9;bd.innerHTML=be.html;bj.appendChild(bd);if(bg.indexOf(bb)>=bg.data.length-1){ba.appendChild(bj)}else{var A=bg.getAt(bg.indexOf(bb)+1);var C=Ext.get(bh+(bm?aL:aF)+A.id);ba.insertBefore(bj,C.dom)}if(bf){bf.setHeight(be.height)}Ext.each(U.dom.childNodes,function(bq){var bp=Ext.get(bq).getAttributeNS(x,R);if(bp==bo){return L}bq.rowSpan=2})},createCompositeRow:function(C,bb,ba,bc,A,a9){var U=[];bb.name=C;if(a9.find("name",C)){U.push('<tr id="',this.id,"_cmp_",C,ah,A.id,'"><td colSpan="',bc,'">');U.push(ba.html);U.push("</td></tr>");bb.html=U.join("")}else{bb.height=ba.height}},removeCompositeEditor:function(A,ba){var bb=this,C=bb.id,bf=ba.id,a9=bb.findColByName(A),be=a9.lock,U=Ext.get(C+(be?aL:aF)+bf),bd=Ext.get(C+(be?aF:aL)+bf);if(bb.currentEditor&&bb.currentEditor.editor instanceof a0){bb.hideEditor()}if(bd){bd.setHeight(22)}Ext.each(U&&U.dom.childNodes,function(bg){if(Ext.get(bg).getAttributeNS(x,R)==A){return L}bg.rowSpan=1});var bc=Ext.get(C+"_cmp_"+A+ah+bf);if(bc){bc.remove()}}});aC.Grid.revision="$Rev$"})($A);