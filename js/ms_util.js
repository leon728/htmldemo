
// IE8 doesn't have 'console' object
if (!window.console) console = {log: function() {}};

$.extend({
	msSel: function(sel) {
		//return $("[name=" + sel + "]");
		return $('.' + sel + ", [name=" + sel + "]");
	}
});

//-----------------------------------------------------------------

/*
$.fn.extend({
	mrender: function(data) {
		console.log(this);
		console.log(this.length);
		console.log(data);
	}
});
*/
function interactiveRow(sel) {
   $("head").append($("<style>" + sel + ":hover{background-color: #A4D1E8; cursor: pointer; cursor: hand; }</style>"));
   // how about use $("body") instead of $(sel).parent()
   $(sel).parent().on("click", sel, function(event){
      $(sel).css("font-weight", "normal");
      $(this).css("font-weight", "bold");
   });
}

$.fn.readonly = function(flag) {
	this.prop("readonly", flag);
	this.css("background-color", (flag ? "#f0f0f0" : "white"));
};

$.fn.msVal = function(value) {
	if(this.length <= 0)
		return;
	// get
	if(typeof(value) === "undefined") {
		var elm = this[0];
		var jv = $(elm);
		var tagName = elm.tagName;
		if(tagName == "INPUT") {
			if(jv.is(":radio")) {
				//return this.filter(":checked").val();
				return this.filter(":checked").val() || null;
			}
			else if(jv.is(":checkbox")) {
				//return jv.prop("checked") ? jv.val() : null;
				if(jv.prop("checked")) {
					return jv.attr("value") ? jv.val() : true;
				}
				else {
					return jv.attr("value") ? null : false;
				}
			}
			else {
				return jv.val();
			}
		}
		else if(tagName == "SELECT") {
			/*if(jv.is("[multiple]")) {
				return jv.find(":selected").map(function(){ return $(this).val(); }).get();
			}
			else {
				return jv.val();
			}*/
			return jv.val() || []; // if none is selected, will return null. we return [] instead of null
		}
		else {
			return jv.text();
		}
	}
	// set
	else {
		renderValue(this, value);
		return this;
	}
};

if(1) {
	$.fn.render = function(data, conf) {
		//if(this.length <= 0)
		//	return;

		this.conf = {};
		$.extend(this.conf, conf);

		//if($.isArray(data)) { renderArray(this, data); }
		//else                { renderObject(this, data); }

		//var etStart = $.now();
		($.isArray(data) ? renderArray : renderObject)(this, data);
		//console.log("time used: " + ($.now() - etStart));
	};
}
else {
	//$("head").append('<script type="text/javascript" src="/js/transparency.min.js"></script>');

	//$.getScript("/js/transparency.min.js");

	//$.getScript( "/js/transparency.min.js", function( data, textStatus, jqxhr ) {
	//	console.log( data.length ); // Data returned
	//	console.log( textStatus ); // Success
	//	console.log( jqxhr.status ); // 200
	//});
}

$.fn.genIntOpt = function(min, max) {
	if (this.prop("tagName") != "SELECT")
		return;

	var self = this;
	self.empty();
	for (var ii = min; ii <= max; ii++) {
		$("<option>").val(ii).text(ii).appendTo(self);
	}
};

function collectMetaData(jelm1, jdat1)
{
	var rpHtml = jelm1.html();

	var rpReg = {};
	var rpRegSkipAll = true;
	/*var rpFindName = {};
	var rpFindNameSkipAll = true;*/
	var rpAttr = [];
	var rpAttrSkipAll = true;

	$.each(jdat1, function(ikey, ivalue){
		if((rpHtml.indexOf("{"+ikey+"}") >= 0)) {
			rpRegSkipAll = false;
			rpReg[ikey] = new RegExp("{"+ikey+"}", 'g');
		}
		/*rpFindName[ikey] = jelm1.find('.' + ikey);
		if(rpFindName[ikey].length > 0) {
			rpFindNameSkipAll = false;
		}*/
		$.each(jelm1[0].attributes, function(){
			//console.log("%s=%s", this.name, this.value);
			if(this.value.indexOf("{" + ikey + "}") >= 0) {
				rpAttrSkipAll = false;
				// avoid duplicate, e.g. class="{c1} {c2}", c1 and c2 are keys of jdat1
				if( /*rpAttr.indexOf(this.name)*/ $.inArray(this.name, rpAttr) < 0 )
				{
					rpAttr.push(this.name);
				}
				if(rpReg[ikey] == null) {
					rpReg[ikey] = new RegExp("{"+ikey+"}", 'g');
				}
			}
		});
	});

	return {
		rpReg: rpReg,
		rpRegSkipAll: rpRegSkipAll,
		rpAttr: rpAttr,
		rpAttrSkipAll: rpAttrSkipAll/*,
		rpFindName: rpFindName,
		rpFindNameSkipAll: rpFindNameSkipAll*/
	};
}

function renderValue(relm, ivalue)
{
	if(relm.length == 0) {
		return;
	}

	$.each(relm.get(), function(rkey, rvalue){
		var tagName = rvalue.tagName;
		var jv = $(rvalue);
		if(tagName == "INPUT") {
			if(jv.is(":radio")) {
				jv.filter("[value=" + ivalue + "]").prop("checked", true);
				//jv.filter("[value=" + ivalue + "]").attr("checked", true);
			}
			else if(jv.is(":checkbox")) {
				jv.prop("checked", (ivalue==true));
				//jv.attr("checked", (ivalue==true));
			}
			else {
				jv.val(ivalue);
			}
		}
		else if(tagName == "SELECT") {
			jv.val(ivalue);
		}
		else {
			jv.text(ivalue);
		}
	});
}

function myescape(str)
{
	if(typeof(str) != "string")
		return str;
/*
	str = str.replace(/\$/g, "&#x24;");
	str = str.replace(/\</g, "&#x3C;");
	str = str.replace(/\>/g, "&#x3E;");
	str = str.replace(/\'/g, "&#x27;");
	str = str.replace(/\"/g, "&#x22;");
	str = str.replace(/\//g, "&#x2F;");
	return str;
*/
	var newstr = "";
	for(var si=0; si<str.length; si++) {
		var c = str.charAt(si);
		switch(c) {
			case '$': newstr += "&#x24;"; break;
			case '<': newstr += "&#x3c;"; break;
			case '>': newstr += "&#x3e;"; break;
			case '\'': newstr += "&#x27;"; break;
			case '"': newstr += "&#x22;"; break;
			case '/': newstr += "&#x2f;"; break;
			default: newstr += c; break;
		}
	}
	return newstr;
}

function renderData(tpl, avalue, metaData, doClone)
{
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
	// when using replace(), use function to avoid special replacement patterns, e.g.
	//   "abc-gogo-123".replace("gogo", "$$")  -->  "abc-$-123"
	//   "abc-gogo-123".replace("gogo", function(){return "$$";})  -->  "abc-$$-123"

	// replace {key}, e.g. <a href='/aa/bb/xx.msp?fn=1234&index={the_key}'>go</a>
	var currElm = doClone ? tpl.clone() : tpl;
	if(!metaData.rpRegSkipAll) {
		var rpHtml = currElm.html();
		$.each(avalue, function(ikey, ivalue){
			if(metaData.rpReg[ikey] == null) {
				return;
			}
			rpHtml = rpHtml.replace(metaData.rpReg[ikey], myescape(ivalue));
		});
		currElm.html(rpHtml);
	}

	if(!metaData.rpAttrSkipAll) {
		$.each(metaData.rpAttr, function(ikey, ivalue){
			var tmpattr = currElm.attr(ivalue);
			$.each(avalue, function(vkey, vvalue){
				if(metaData.rpReg[vkey] == null) {
					return;
				}
				tmpattr = tmpattr.replace(metaData.rpReg[vkey], function(){return vvalue;});
			});
			//currElm.prop(ivalue, tmpattr);
			currElm.attr(ivalue, tmpattr);
		});
	}

	// replace using attribute 'class' as key, e.g. <div class='the_key'>the_value</div>
	$.each(avalue, function(ikey, ivalue){
		//var allElm = currElm.find('.' + ikey);
		var eFilter = currElm.filter('.' + ikey + ", [name=" + ikey + "]");
		var eFind   = currElm.find  ('.' + ikey + ", [name=" + ikey + "]");
		var allElm = eFilter.add(eFind);
		if(ivalue == null) {
			return;
		}
		if(typeof(ivalue) == "object") {
			// auto set name to array with primitive values
			// e.g. st:[1,2,3] ==> st:[{st_value:1}, {st_value:2}, {st_value:3}]
			if($.isArray(ivalue) && typeof(ivalue[0]) != "object") {
				arrAddName(ivalue, ikey + "_value");
			}
			//eFind.render(ivalue);
			allElm.render(ivalue);
		}
		else {
			renderValue(allElm, ivalue);
		}
	});

	return currElm;
}

var bak_robj = {};
function renderObject(jElm, jObj)
{
	if(jElm.length <= 0)
		return;

	if(jElm.length > 1)
		console.log("renderObject(): multiple target, selector=" + jElm.selector);

	//$.each(jObj, function(ikey, ivalue){
	//	jElm.find('.' + ikey).text(ivalue);
	//});

	var selector = jElm.selector;
	var rpat = new RegExp("{\\w+}");
	if(selector) {
		selector += getPathIndex(jElm);
		if(jElm[0].tagName == "BODY") {
			// do nothing
		}
		else if(!bak_robj[selector]) {
			//bak_robj[selector] = jElm.get(0).outerHTML;

			bak_robj[selector] = {};

			var myattrs = []; // [key1, value1, key2, value2, ...]
			$.each(jElm[0].attributes, function(){
				if(rpat.test(this.value)) {
					myattrs.push(this.name);
					myattrs.push(this.value);
				}
			});
			bak_robj[selector]['attr'] = myattrs;

			if(rpat.test(jElm.html())) {
				bak_robj[selector]['html'] = jElm.html();
			}
		}
		else {
			//var newElm = $(bak_robj[selector]);
			//jElm.after(newElm);
			//jElm.remove();
			//jElm = newElm;

			$.each(bak_robj[selector]['attr'], function(k,v){
				if(k%2)
					return;
				jElm.attr(bak_robj[selector]['attr'][k], bak_robj[selector]['attr'][k+1]);
			});

			if(bak_robj[selector]['html']) {
				jElm.html(bak_robj[selector]['html']);
			}
		}
	}

	var metaData = collectMetaData(jElm, jObj);
	renderData(jElm, jObj, metaData, false);
}

/**
 * remove comments (recursive)
 */
function removeComments(elm)
{
	$(elm).contents().each(function(k,v){
		if(v.nodeType == 1)
			removeComments(v);
		else if(v.nodeType == 8)
			$(v).remove();
	});
}

function getPathIndex(je)
{
	var ss = "";
	var pp = je;
	while(true) {
		//console.log("= pp=%d, pp.parent=%d, index=%d", pp.length, pp.parent().length, pp.index());
		if(pp.index() < 0) {
			ss = "." + ss;
			break;
		}
		if(pp[0].tagName == "BODY") {
			break;
		}
		ss = "." + pp.index() + ss;
		pp = pp.parent();
	}
	return ss;
}

var bak_renderArray = {};
var bak_renderArray_mark = {};
function renderArray(jElm, jArr/*, trStart*/)
{
/*	if(typeof(trStart)==='undefined') trStart = 1;

	//var tpl = jElm.find(">tr").eq(0);
	//var tpl = jElm.find(">tr:eq(0)");
	var tpl = jElm.find("tr:eq(" + trStart + ")");

	//jElm.empty();
	jElm.find("tr:gt(" + trStart + ")").remove();
*/
/*	var tpl = jElm.find("> :eq(0)");

	//jElm.find("> :gt(0)").remove(); // keep template
	jElm.empty();                   // not keep template
*/
	var selector = jElm.selector;
	//selector = "." + selector.match(/\w+/)[0] + "_bak";
	if(selector) {
		selector += getPathIndex(jElm);

		// in normal case, jElm is on DOM tree, selector will like ".mylist.3.1.0'
		// but after render with zero array, jElm is not on DOM tree, selector will like ".mylist."
		// we have to take it as ".mylist.3.1.0"
		var ra = bak_renderArray[selector];
		if(!ra) {
			$.each(bak_renderArray, function(k,v){
				if(k.indexOf(selector) == 0) {
					ra = k;
					selector = k;
				}
			});
		}

		if(!ra) {
			if(jElm.length <= 0)
				return;

			jElm.filter(":gt(0)").remove();
			jElm = jElm.eq(0);

			//removeComments(jElm);
			bak_renderArray[selector] = jElm.get(0).outerHTML;
			bak_renderArray_mark[selector] = $("<!-- " + selector + " -->");
			jElm.before(bak_renderArray_mark[selector]);
		}
		else {
			jElm.remove();
			jElm = $(bak_renderArray[selector]);
			bak_renderArray_mark[selector].after(jElm);
		}
	}

	if(jElm.length != 1) {
		//console.log("ss: sel=(%12s), len=%d", selector, jElm.length);
		return;
        // if(jElm <= 0) {
        //     return;
        // }
        // jElm.filter(":gt(0)").remove();
        // jElm = jElm.eq(0);
	}

	var tpl = jElm;

	if(jArr.length == 0) {
		//tpl.hide();
		tpl.remove();
		return;
	}
	//tpl.show();

	// get meta-data, performance boost more than 200% after this optimization
	if(jArr[0].i0 == undefined) {
		jArr[0].i0 = 0;
		jArr[0].i1 = 1;
	}
	var metaData = collectMetaData(tpl, jArr[0]);

	//var etStart = $.now();
	var elmlist = [];
	$.each(jArr, function(akey, avalue){
		if(avalue.i0 == undefined) {
			avalue.i0 = akey;
			avalue.i1 = akey+1;
		}
		var currElm = renderData(tpl, avalue, metaData, true);
		//jElm.append(currElm);
		elmlist.push(currElm);
	});
	tpl.after(elmlist);
	tpl.remove();

	//tpl.hide();
	//console.log("time used: " + ($.now() - etStart));
}

/**
 * example:
 *
 * arr = [1, 2, 3]
 * arrAddName(arr, 'vs')
 *
 * arr --> [
 *   {vs: 1},
 *   {vs: 2},
 *   {vs: 3},
 * ]
 */
function arrAddName(arr, keyname)
{
	if($.isArray(arr) == false || typeof(arr[0]) == 'object') {
		return arr;
	}

	$.each(arr, function(idx, value){
		arr[idx] = {};
		arr[idx][keyname] = value;
	});
	return arr;
}

/**
 * for example:
 *
 * var arr = [ {status:1, desc:'a'}, {status:1, desc:'b'}, {status:2, desc:'c'} ]
 *
 * arrEnum(arr, 'status', {1:'active', 2:'standby'});
 * --> [ {status:'active', desc:'a'}, {status:'active', desc:'b'}, {status:'standby', desc:'c'} ]
 */
function arrEnum(arr, keyname, enumstr)
{
	$.each(arr, function(idx, value){
		var val = value[keyname];
		value[keyname] = enumstr[val];
	});
	return arr;
}

/**
 * test if two JSON data have the same values
 * (deep/recursive comparison)
 */
function isSameValue(a, b)
{
	// type : typeof()
	//------------------
	// undefined: undefined
	// true/false: boolean
	// 123: number
	// 'abc': string
	// null: object
	// {}: object
	// []: object

	var a_type = typeof(a);
	var b_type = typeof(b);
	if(a_type != b_type)
		return false;

	if(a_type!='object')
		return a==b;

	if(a==null || b==null)
		return a==b;

	var a_len = $.isArray(a) ? a.length : -1;
	var b_len = $.isArray(b) ? b.length : -1;
	if(a_len != b_len)
		return false;

	var allok = true;
	var a_item = 0;
	$.each(a, function(k,v) {
		a_item++;
		var tmp = isSameValue(a[k], b[k]);
		if(!tmp) {
			allok = false;
			return false;
		}
	});

	if(a_len >= 0 || !allok)
		return allok;

	// check for this case: a:{x:1,y:2}, b:{x:1,y:2,z:3}
	var b_item = 0;
	$.each(b, function(k,v) {
		b_item++;
		if(b_item > a_item) {
			allok = false;
			return false;
		}
	});
	return allok;
}

function _parseFormElement(jelm)
{
	var result = {};
	var all_done = $();
//	console.log("jelm.len: " + jelm.length);
	jelm.each(function(k,v){
		v = $(v);
		if(all_done.is(v))
			return;
		var ename = v.attr("name");
		var currset = jelm.filter("[name=" + ename + "]");
		all_done = all_done.add(currset);
		//console.log(v.is(v));
//		console.log("currset: len=%d, name=%s", currset.length, ename);

		if(currset.is(":radio")) {
			result[ename] = currset.msVal();
		}
		else {
			//console.log(currset.prop("data-type"), currset.attr("data-type"), currset.prop("data-type") == "[]", currset.attr("data-type") == "[]");
			//if(currset.length > 1 || currset.is("[data-type=\\[\\]]"))
			//if(currset.is("[data-type=\\[\\]]"))
			if(currset.attr("data-type") == "[]")
			{
				if(!result[ename]) {
					result[ename] = [];
					result[ename]['data-type'] = '[]';
				}
				currset.each(function(ek,ev){
					result[ename].push($(ev).msVal());
				});
			}
			else
			{
				if(currset.length > 1) {
					console.log("duplicate name: " + ename);
					console.log(currset);
				}
				result[ename] = v.msVal();
			}
		}
	});

//	console.log(JSON.stringify(result, null, '  '));
	return result;
}

/**
 * parse all input elements (<input>, <select>)
 * return a JSON object
 *
 * usually we send data using {key1:value1, key2:value2, ...}
 * e.g.
 *  <input name='aa' value='a1'>
 *  <input name='msg' value='gogo'>
 * --> {
 *       aa:'a1',
 *       msg:'gogo'
 *     }
 *
 * but sometimes we want to send data as array
 * you can have inputs with the same name, and put an attribute data-type="[]"
 * e.g.
 *  <tr>
 *      <input name='x' data-type="[]" value='x1'>
 *      <input name='y' data-type="[]" value='y1'>
 *      <input name='z' data-type="[]" value='z1'>
 *  </tr>
 *  <tr>
 *      <input name='x' data-type="[]" value='x2'>
 *      <input name='y' data-type="[]" value='y2'>
 *      <input name='z' data-type="[]" value='z2'>
 *  </tr>
 * --> arrdata:[
 *      {x:'x1', y:'y1', z:'z1'},
 *      {x:'x2', y:'y2', z:'z2'},
 *     ]
 * @param jelm: can be a selector string, an element, a jQuery object
 */
function parseForm(jelm)
{
	jelm = $(jelm);
//	console.log(jelm.serialize().split('&'));   // standard html form processing
//	console.log(jelm.serializeJSON());          // JSON format, (string), (by jquery.serialize-object.min.js)
//	console.log(jelm.serializeObject());        // JSON format, (object), (by jquery.serialize-object.min.js)

	var result = {};
	var allinput = jelm.find("input[name]");
	var target;

//	console.log("allinput: %d", allinput.length);

	// select
	$.extend(result, _parseFormElement(jelm.find("select")));

	// checkbox
	target = allinput.filter(":checkbox");
	$.extend(result, _parseFormElement(target));
	allinput = allinput.not(target);

	// radio
	target = allinput.filter(":radio");
	$.extend(result, _parseFormElement(target));
	allinput = allinput.not(target);

	// the rest
	$.extend(result, _parseFormElement(allinput));

	// convert column-wise array to row-wise array
	//
	// e.g. input data is:
	//   row 0: a=1, b=7
	//   row 1: a=2, b=8
	//   row 2: a=3, b=9
	//
	// column-wise
	//   {a:[1,2,3], b:[7,8,9]}
	//
	// row-wise
	//   {arrdata:[
	//     {a:1, b:7},
	//     {a:2, b:8},
	//     {a:3, b:9},
	//   ]}
	// --------
	//jsdump(result);
	var arrdata = [];
	$.each(result, function(k,v){
		if(!v || v['data-type'] != '[]')
			return;
		for(var ai=0; ai<v.length; ai++) {
			if(arrdata[ai] == null)
				arrdata[ai] = {};
			arrdata[ai][k] = v[ai];
		}
		delete result[k];
	});
	result['arrdata'] = arrdata;
	//jsdump(result);
	// --------

	formJsonData(jelm, result);
	//console.log(JSON.stringify(result, null, '  '));

	return result;
}

function formJsonData(jelm, jobj)
{
	delete jobj['_jsData_'];

	jelm = jelm.eq(0);
	if(!jelm.is("form")) {
		return;
	}

	jelm.find("[name=_jsData_]").remove();

	//var _jsData_ = $('<input type="hidden" name="_jsData_">');
	var _jsData_ = $("<input>", {
		type : "hidden",
		name : "_jsData_",
		value: JSON.stringify(jobj)
	});
	//console.log(_jsData_.val());

	_jsData_.appendTo(jelm);
}

function mjSubmitEvent(event) {
	//event.preventDefault();

	// HTML element of event source (who generate this event): "this", or "event.target"
	//console.log(event.target);
	//console.log(this);

	mjSubmit(this);
}

function mjSubmit(jelm) {
	jelm = $(jelm);

	/*
	 var tform = $("<form>", {
		action: jelm.prop('action'),
		method: jelm.prop('method')
	 });
	 tform.append($("<input>", {
		type : "hidden",
		name : "_jsData_",
		value: jelm.serializeJSON()
	 }));
	 tform.submit();
	 return false;
	 */

	formJsonData(jelm, jelm.serializeObject());
}

function ajaxLoader (el, options) {
	// Becomes this.options
	var defaults = {
		bgColor         : '#fff',
		duration        : 0,//800,
		opacity         : 0.7,
		classOveride    : false
	};
	this.options    = jQuery.extend(defaults, options);
	this.container  = $(el);
	this.init = function() {
		var container = this.container;
		// Delete any other loaders
		this.remove();
		// Create the overlay
		var overlay = $('<div></div>').css({
			'background-color': this.options.bgColor,
			'opacity':this.options.opacity,
			'width':container.width(),
			'height':container.height(),
			'position':'absolute',
			'top':'0px',
			'left':'0px',
			'z-index':99999
		}).addClass('ajax_overlay');
		// add an overiding class name to set new loader style
		if (this.options.classOveride) {
			overlay.addClass(this.options.classOveride);
		}
		// insert overlay and loader into DOM
		container.append(
			overlay.append($('<div></div>').addClass('ajax_loader')).fadeIn(this.options.duration)
		);
	};
	this.remove = function(){
		var overlay = this.container.children(".ajax_overlay");
		if (overlay.length) {
			overlay.fadeOut(this.options.duration, function() {
				overlay.remove();
			});
		}
	};
	this.init();
}

/**
 * add hidden input with (key, value) into a form
 *
 * e.g.
 * setFormVariable($("form:eq(0)"), "_web_opmode", 1);
 *  will add <input type=hidden name=_web_opmode value=1> into the form
 */
function setFormVariable(elmForm, key, value) {
	var fvar = $(elmForm).find("input[name=" + key +"]");
	if(fvar.length == 0) {
		fvar = $("<input name='" + key + "' type='hidden'>");
		fvar.appendTo($(elmForm));
	}
	fvar.val(value);
}

/*
 window.location.href   : http://aa/bb/cc.msp?x=123&y=456
 window.location.search : ?x=123&y=456
 getUrlParam("x") : "123"
 getUrlParam("y") : "456"
 getUrlParam("s") : null
 */
function getUrlParam(name) {
	var reg = new RegExp("[?&]" + name + "=(.*?)&");
	var parm = (window.location.search + "&").match(reg);
	return parm == null ? null : decodeURIComponent(parm[1]);
}

// dumpForm($('form:first'));
// dumpForm($('form:eq(0)'));
function dumpForm(f)
{
	$.each(f.serialize().split("&"), function(ikey, ivalue){
		console.log(ivalue);
	});
}

function jsdump(obj)
{
	var str = JSON.stringify(obj, null, '  ');
	console.log(str);
}

function jstest(selector)
{
	$("*")
		.css("border", "")
		//.css("backgroud-color", "white")
	;

	$(selector)
		.css("border", "solid 1px red")
		//.css("background-color", "yellow")
	;
}

/*
	usage example:

	$(window).load(function(){
		$(".div-row-topPannel").each(function(k,v){ panel_autoWidth(v); });
		$(".div-row-bottomPannel").each(function(k,v){ panel_autoWidth_findUp(v); });
		$(".div-row-button").each(function(k,v){
			// if div-row-button is above div-row-topPannel, use panel_autoWidth_findUp(), else, use panel_autoWidth_findDown()
			// each div-row-button may be above/below div-row-topPannel
			// so you may have to do something like this: if(k==0){panel_autoWidth_findUp(v);} else if(k==2){panel_autoWidth_findDown(v);}
			panel_autoWidth_findDown(v);
		});
	});
 */
function panel_autoWidth(selector) {
	var js = $(selector).next();
	var jsleft = js.offset().left;
	var jstop = js.offset().top;
	var maxw = js.offset().left + js.width();
	while(true)
	{
//			console.log(js.offset(), js.width()/*, js.get(0)*/);
		js = js.next();
		var joffset = js.offset();
		if(joffset.top != jstop || joffset.left <= jsleft) {
			break;
		}
		maxw = Math.max(maxw, joffset.left + js.width());
	}
	$(selector).width(maxw - jsleft);
}
function panel_autoWidth_findUp(selector) {
	var k = $(selector).prevUntil(".div-row-topPannel").last();
	if(k.length == 0)
		k = $(selector);
	$(selector).width(k.prev().width());
}
function panel_autoWidth_findDown(selector) {
	var k = $(selector).nextUntil(".div-row-topPannel").last();
	if(k.length == 0)
		k = $(selector);
	$(selector).width(k.next().width());
}

function iframeAutoResize(selector)
{
	$(function(){
		setInterval(function(){
			var iframeDoc = $(selector).get(0).contentWindow.document;
			if(iframeDoc.body == null) {
				//console.log("body is null");
				return;
			}

			//console.log("--------------------------");
			//console.log(iframeDoc.body.scrollHeight, iframeDoc.body.offsetHeight, iframeDoc.body.clientHeight);
			//console.log(iframeDoc.scrollHeight, iframeDoc.offsetHeight, iframeDoc.clientHeight);
			//console.log(iframeDoc.documentElement.scrollHeight, iframeDoc.documentElement.offsetHeight, iframeDoc.documentElement.clientHeight);
			//console.log($(iframeDoc.body).height(), $(iframeDoc).height());

			//$(selector).height($(iframeDoc).height());
			//$(selector).height( Math.min($(iframeDoc).height(), iframeDoc.body.scrollHeight));
			$(selector).height( Math.min(iframeDoc.body.scrollHeight, iframeDoc.documentElement.scrollHeight));
		}, 100);
	});
}

//----------------------------------------------------------------------------------------------------------------
var timeToLogout = 0;
var timeToWarn = 60;

var sessionData = null;

var sessionIsError = false;
var sessionIsLogout = false;

var sessionRecheck = false;

function sessionCheck()
{
	if(sessionRecheck) {
		sessionRecheck = false;

		sessionData = null;
		sessionIsError = false;
		sessionIsLogout = false;
	}

	if(sessionIsError || sessionIsLogout) {
		return;
	}

	if(sessionData) {
		var timeLeft = sessionData["idle_logout"] - sessionData["idleTime"] - 1; // minus 1: reserve a little time margin
		timeLeft -= (new Date().getTime() - sessionData['now']) / 1000;

		if(timeLeft > timeToWarn) {
			return;
		}
	}

	$.ajax({
		url: "/_.msp?fn=webUtil,checkSession&t=" + new Date().getTime(),
		dataType: "json",
		success: function(data) {
			sessionData = data;
			sessionData['now'] = new Date().getTime();
			timeToWarn = sessionData['idle_warn'];
			var timeLeft = sessionData["idle_logout"] - sessionData["idleTime"] - 1; // minus 1: reserve a little time margin

			$("#currUser").text(sessionData["user"]);
			$(".timeLeft").text(timeLeft <= timeToLogout ? "--" : Math.ceil(timeLeft)/*parseInt(timeLeft)*/);

			if(timeLeft <= timeToLogout) {
				if(!dlgLogin.dialog("isOpen")) {
					$("#lg_user").val("");
					$("#lg_pass").val("");
					$(".lgMsg").text("");
				}
				dlgIdle.dialog("close");
				dlgLogin.dialog("open");
				sessionIsLogout = true;
			}
			else if(timeLeft <= timeToWarn) {
				dlgIdle.dialog("open");
				dlgLogin.dialog("close");
			}
			else {
				dlgIdle.dialog("close");
				dlgLogin.dialog("close");
			}
		},
		error: function() {
			sessionIsError = true;
		}
	});
}

var sessionTimerId;
function sessionInit() {
	var pname = window.location.pathname;
	var isMsp = (pname.lastIndexOf(".msp") == (pname.length - 4));
	//var isHtml = (pname.lastIndexOf(".html") == (pname.length - 5));

	if(window != window.top || !isMsp) {
		return;
	}

	load_js("/jquery-ui/jquery-ui.min.js");
	load_css("/jquery-ui/theme/jquery-ui.min.css");

	// wait 300 ms for loading jquery-ui
	setTimeout(function(){
		$('<div>').load("/dlg_login.html").appendTo("body");
		$('<div>').load("/dlg_idle.html").appendTo("body");
		sessionCheck();
		sessionTimerId = setInterval(sessionCheck, 1000);
	}, 300);
}

$(function(){
	sessionInit();
/*
	// get cookie: "JSESSIONID"
	var ssid = "";
	$(document.cookie.split(';')).each(function(k1,v1){
		var ss = v1.split('=');
		if(ss[0] == "JSESSIONID") {
			ssid = ss[1];
		}
	});

	// put into each <form>: <input type="hidden" name="_csrf_">
	$("form").each(function (k,v) {
		$(v).find("[name=_csrf_]").remove();
		$(v).prepend($("<input>", {
			type: 'hidden',
			name: '_csrf_',
			value: ssid
		}));
	});
*/
});

//-------------------------------

function load_js(filename)
{
	var fileref = document.createElement('script');
	fileref.setAttribute("type","text/javascript");
	fileref.setAttribute("src", filename);
	document.getElementsByTagName("head")[0].appendChild(fileref);
}

function load_css(filename)
{
	var fileref = document.createElement("link");
	fileref.setAttribute("rel", "stylesheet");
	fileref.setAttribute("type", "text/css");
	fileref.setAttribute("href", filename);
	document.getElementsByTagName("head")[0].appendChild(fileref);
}

// example:
//  load_js("../jquery-ui/jquery-ui.min.js");
//  load_css("../jquery-ui/theme/jquery-ui.min.css");

//----------------------------------------------------------------------------------------------------------------

/*
 callbacks:
 - when slot/port value is init: function lc_init_slotport(islot, iport, slotData)
 - when slot is changed: function lc_load_slot(islot, slotData)
 - when load pressed: function lc_load_slotport(islot, iport, slotData)
 */
MsSlotPort = function(conf)
{
	this.conf = conf;
	this.lc_data = [];

	this.loadInit = conf['loadInit'] ? conf['loadInit'] : function(slot, slotData){
		//console.log("[init] slot:%s", slot);
	};
	this.loadSlot = conf['loadSlot'] ? conf['loadSlot'] : function(slot, slotData){
		//console.log("[slot] slot:%s", slot);
	};
	this.loadSlotPort = conf['loadSlotPort'] ? conf['loadSlotPort'] : function(slot, port, slotData){
		//console.log("[s,p ] slot:%s, port:%s", slot, port);
	};
	this.selSlotPort = conf['selSlotPort'] ? conf['selSlotPort'] : function(slot, port, slotData){
		//console.log("[s,p ] slot:%s, port:%s", slot, port);
	};
	this.preSelect = conf['preSelect'] ? conf['preSelect'] : function(slot, slotData){
		return true;
	};
	this.slotLink = conf['slotLink'] ? conf['slotLink'] : function(slot, slotData){
		return null;
	};

	this.get_lctable_data();
};

MsSlotPort.prototype.get_lctable_data = function() {
	var self = this;
	var url = "/_.msp?fn=webUtil,getLcList&t=" + new Date().getTime();
	$.get(url, function(data){
		self.init(data);
	}, "json");
};

MsSlotPort.prototype.init = function(data)
{
	var self = this;

	this.selSlot = $.msSel("lctbl_selSlot");
	this.selPort = $.msSel("lctbl_selPort");
	this.selLoad = $.msSel("lctbl_selLoad");
	this.lc_data = data;

	//--------------------------------------------------------
	this.initSlotPort(this.lc_data, this.conf['slot'], this.conf['port']);

	this.selLoad.click(function(event){
		var vslot = self.slot();
		var vport = self.port();
		self.loadSlotPort(vslot, vport, self.lc_data[vslot]);
	});

	//--------------------------------------------------------
	$(".lctbl_card").render(this.lc_data);

	$.each(data, function(k,v){
		var strLink = self.slotLink(v['slot'], v);
		if(!strLink)
			return;

		var tdSlot = $(".lctbl_card").eq(k).children(":eq(0)");
		var link = $("<a>", {
			text: tdSlot.text(),
			href: strLink
		});
		link.click(function(event){
			event.preventDefault();
			var mhform = $("<form>", {
				action: strLink
			}).append($("<input>", {
				type: "hidden",
				name: "_jsData_",
				value: JSON.stringify(v)
			}));
			mhform.appendTo("body");
			mhform.submit();
			mhform.remove();
		});
		tdSlot.empty().append(link);
	});

	$.each($(".lctbl_port").get(), function(key,value){
		value = $(value);
		value.empty();

		var pnum = self.lc_data[key]['portNum'];
		$(".lctbl_port").eq(key).prop("disabled", !pnum);
		$(".lctbl_load").eq(key).prop("disabled", !pnum);

		for(var pi = 0; pi < pnum; pi++) {
			$("<option>").val(pi).text(pi + 1).appendTo(value);
		}
	});

	$(".lctbl_load").click(function(event){
		var jsrc = $(this);
//		var mytr = jsrc.parentsUntil("tbody").last();
//		var ci = $(".lcCards").index(mytr);
		var vslot = $(".lctbl_load").index(jsrc);
		var vport = parseInt($(".lctbl_port").eq(vslot).val());
		self.loadSlotPort(vslot, vport, self.lc_data[vslot]);
	});
};

MsSlotPort.prototype.slot = function(value)
{
	// get
	if(value == undefined) {
		return parseInt(this.selSlot.val());
	}
	// set
	else {
		this.selSlot.val(value);
		this.selSlot.trigger("change");
	}
};

MsSlotPort.prototype.port = function(value)
{
	// get
	if(value == undefined) {
		var k = parseInt(this.selPort.val());
		return isNaN(k) ? -1 : k;
	}
	// set
	else {
		this.selPort.val(value);
		this.selPort.trigger("change");
	}
};

MsSlotPort.prototype.initSlotPort = function(data, slot_value, port_value)
{
	var self = this;

	this.initSlot(data);
	if(!isNaN(parseInt(slot_value)))
		this.slot(slot_value);

	this.initPort();
	if(!isNaN(parseInt(port_value)))
		this.port(port_value);

	//this.selSlot.val(this.selSlot.children(":first").val());
	//this.selSlot.trigger("change");

	var vslot = this.slot();
	//var vport = this.port();

	if(!isNaN(parseInt(slot_value))) {
		this.loadInit(vslot, /*vport, */data[vslot]);
	}
	else {
		$.each(data, function(k,v){
			if(!self.preSelect(v['slot'], v))
				return; // continues to next entry in data
			var vslot = v['slot'];
			//self.slot(vslot);
			self.selSlot.val(vslot);
			self.initPort();
			self.loadInit(vslot, data[vslot]);
			return false;
		});
	}

	this.selSlot.change(function(event) {
		var vslot = self.slot(); // parseInt($(this).val());
		self.initPort();
		self.loadSlot(vslot, data[vslot]);
	});

	this.selPort.change(function(event) {
		var vslot = self.slot();
		var vport = self.port();
		self.selSlotPort(vslot, vport, data[vslot]);
	});
};

// e.g. valid when slot is active
MsSlotPort.prototype.isSlotValid = function(slotdata)
{
	//todo: define stat, e.g. none, active, standby, inactive, ...
	return slotdata['stat'] == 3;
};

// generate options for slot
MsSlotPort.prototype.initSlot = function(data)
{
	var self = this;

	this.selSlot.empty();
	$.each(data, function(fkey,fvalue){
		var slotText = "";
		if(self.isSlotValid(fvalue)) {
//			slotText = " (" + fvalue['cardType_str'] + ")";
			slotText = " - " + fvalue['cardType_str'];
			if(fvalue['stat'] == 4) {
				// 3 is active, 4 is standby
				slotText += " (standby)";
			}
		} else {
//			return; // only show active slots
			slotText = " - ";
		}

//		$("<option>").val(fvalue.slot).text(fvalue.slot + 1).appendTo(selSlot);
		$("<option>", {
			value: fvalue.slot,
			text : fvalue.slot+1 + slotText
		}).appendTo(self.selSlot);
	});
};

// generate options for port, by slot's portNum
MsSlotPort.prototype.initPort = function(/*num*/)
{
	//if(typeof(num) == 'undefined') {
	//	num = this.lc_data[this.slot()]['portNum'];
	//}
	var num = this.lc_data[this.slot()]['portNum'];

	var isValid = this.isSlotValid(this.lc_data[this.slot()]);
	this.selPort.prop("disabled", !isValid);
	this.selLoad.prop("disabled", !isValid);

	this.selPort.empty();
	for(var pi = 0; pi < num; pi++) {
//		$("<option>").val(pi).text(pi + 1).appendTo(selPort);
		$("<option>", {
			value: pi,
			text : pi+1
		}).appendTo(this.selPort);
	}
};

//---------------------------------
// MsAPI
//---------------------------------

MsAPI = function(){};
var msapi = new MsAPI(); // create instance

MsAPI.prototype.clickApply = function(hidActName, callback)
{
	var hidAct = $("[name=" + hidActName + "]");
	hidAct.val(1);
	if (do_callback(callback) == false)
		return false;
	hidAct.parents("form").submit();
};

MsAPI.prototype.clickDelete = function(hidActName)
{
	var hidAct = $("[name=" + hidActName + "]");
	hidAct.val(4);
	hidAct.parents("form").submit();
};

MsAPI.prototype.clickNew = function()
{
	pfList_deselect();
	pageRender();
};

MsAPI.prototype.clickCancel = function()
{
	pageRender();
};

MsAPI.prototype.clickModify = function()
{
	pageRender();
};

//---------------------------------
// MsPagination
//---------------------------------

MsPage = function()
{
	this.dataOffset = 0;
	this.dataTotal = 0;
	this.pageSize = 0;

	//$("#pageOffset").change(this.goto);
	//$("#btnPrevPage").click(this.prev);
	//$("#btnNextPage").click(this.next);

	this.load();
	//MsPage.prototype.load.call(this);
};

MsPage.prototype.load = function()
{
	this.dataOffset = initJsData.dataOffset;
	this.dataTotal = initJsData.dataTotal;
	this.pageSize = initJsData.pageSize;
	console.log("init: dataOffset:%d, dataTotal:%d, pageSize:%d", this.dataOffset, this.dataTotal, this.pageSize);
	if(!this.pageSize) {
		$("#pageControl").hide();
	}
	else {
		if(this.setDataOffset(this.dataOffset)) {
			return;
		}

		$("#pageOffset").val(this.dataOffset / this.pageSize + 1);
		$("#pageTotal").text(Math.ceil(this.dataTotal / this.pageSize)); // parseInt((this.dataTotal + this.pageSize - 1) / this.pageSize)
		//$("#dataTotal").text("total " + this.dataTotal);
		$("#dataTotal").text("showing " + (this.dataOffset+1) + " ~ " + Math.min(this.dataOffset + this.pageSize, this.dataTotal) + ", total " + this.dataTotal);

		var disablePrev = (this.dataOffset <= 0);
		var disableNext = (this.dataOffset + this.pageSize >= this.dataTotal);
		$("#btnPrevPage").prop("disabled", disablePrev);
		$("#btnNextPage").prop("disabled", disableNext);
		$("#pageOffset").prop("disabled", disablePrev && disableNext);
	}
};

MsPage.prototype.goto = function(n)
{
	this.setDataOffset(n * this.pageSize);
};

MsPage.prototype.prev = function()
{
	this.setDataOffset(this.dataOffset - this.pageSize);
};

MsPage.prototype.next = function()
{
	this.setDataOffset(this.dataOffset + this.pageSize);
};

MsPage.prototype.setDataOffset = function(value)
{
	var old_dataOffset = this.dataOffset;
	this.dataOffset = value;
	if(this.dataOffset < 0) {
		this.dataOffset = 0;
	}
	if(this.dataOffset >= this.dataTotal) {
		this.dataOffset = Math.floor((this.dataTotal-1) / this.pageSize) * this.pageSize;
	}
	this.dataOffset -= (this.dataOffset % this.pageSize);
	if(this.dataOffset == old_dataOffset) {
		$("#pageOffset").val(old_dataOffset / this.pageSize + 1);
		return false;
	}
	console.log("page: dataOffset:%d, dataTotal:%d, pageSize:%d", this.dataOffset, this.dataTotal, this.pageSize);

//	window.location = "/qq.msp?fn=1304&pageSize=" + this.pageSize + "&dataOffset=" + this.dataOffset;
//	$('body').load("/qq.msp?fn=1304&pageSize=" + this.pageSize + "&dataOffset=" + this.dataOffset);

//	// var loading = new ajaxLoader($('body') /*, {duration:500} */);
//	$.get("/_.msp?fn=1304&pageSize=" + this.pageSize + "&dataOffset=" + this.dataOffset, function(data){
//		// loading.remove();
//		initJsData = $.parseJSON(data);
//		docInit();
//	});

//	window.location.href = "?fn=" + getUrlParam("fn") + "&pageSize=" + this.pageSize + "&dataOffset=" + this.dataOffset;
	window.location.href = "?fn=1304&pageSize=" + this.pageSize + "&dataOffset=" + this.dataOffset;
};

//---------------------------------
// MsPagination - offline data
//---------------------------------

MsPageOffline = function(conf)
{
	var self = this;
	this.conf = {
		data: [],
		dataOffset: 0,
		pageSize: 0
	};
	$.extend(this.conf, conf);

	this.data = this.conf['data'];
	this.dataTotal = this.data.length;
	this.dataOffset = this.conf['dataOffset'];
	this.dataOffset_old = -1;
	this.pageSize = this.conf['pageSize'];
	//console.log("init: dataOffset:%d, dataTotal:%d, pageSize:%d", this.dataOffset, this.dataTotal, this.pageSize);

	this.jqPageControl = $(this.conf['jqPageControl']);
	this.jqPageOffset = $(this.conf['jqPageOffset']);
	this.jqPageTotal = $(this.conf['jqPageTotal']);
	this.jqBtnPrev = $(this.conf['jqBtnPrev']);
	this.jqBtnNext = $(this.conf['jqBtnNext']);
	this.jqTxtDataNow = $(this.conf['jqTxtDataNow']);

	if(this.pageSize == undefined || this.pageSize <= 0) {
		this.pageSize = this.dataTotal;
		this.jqPageControl.hide();
	}
	this.setDataOffset(this.dataOffset);

	this.jqPageOffset.change(function(event){
		self.goto($(this).val()-1);
	});
	this.jqPageOffset.keypress(function(event){
		if(event.keyCode==13) {
			event.preventDefault();
			$(this).trigger("change");
		}
	});
	this.jqBtnPrev.click(function(event){ self.prev(); });
	this.jqBtnNext.click(function(event){ self.next(); });
};

MsPageOffline.prototype.goto = function(n) { this.setDataOffset(n * this.pageSize); };
MsPageOffline.prototype.prev = function()  { this.setDataOffset(this.dataOffset - this.pageSize); };
MsPageOffline.prototype.next = function()  { this.setDataOffset(this.dataOffset + this.pageSize); };

MsPageOffline.prototype.setDataOffset = function(value)
{
	var self = this;

	// check offset for valid/min/max/start_of_page
	this.dataOffset = isNaN(value) ? 0 : value;
	if(this.dataOffset < 0) {
		this.dataOffset = 0;
	}
	if(this.dataOffset >= this.dataTotal) {
		this.dataOffset = Math.floor((this.dataTotal-1) / this.pageSize) * this.pageSize;
	}
	this.dataOffset -= (this.dataOffset % this.pageSize);

	if(this.dataOffset == this.dataOffset_old) {
		this.jqPageOffset.val(this.dataOffset / this.pageSize + 1);
		return false;
	}
	this.dataOffset_old = this.dataOffset;

	//console.log("page: dataOffset:%d, dataTotal:%d, pageSize:%d", this.dataOffset, this.dataTotal, this.pageSize);
	var currData = this.data.slice(this.dataOffset, Math.min(this.dataOffset+this.pageSize, this.dataTotal));
	$.each(currData,function(k,v){
		v.i0 = k + self.dataOffset;
		v.i1 = k + self.dataOffset + 1;
	});
	$(this.conf['jqRenderTarget']).render(currData);

	this.jqPageOffset.val(this.dataOffset / this.pageSize + 1);
	this.jqPageTotal.text(Math.ceil(this.dataTotal / this.pageSize)); // parseInt((this.dataTotal + this.pageSize - 1) / this.pageSize)
	//this.jqTxtDataNow.text("total " + this.dataTotal);
	this.jqTxtDataNow.text("showing " + (this.dataTotal <= 0 ? 0 : this.dataOffset+1) + " ~ " + Math.min(this.dataOffset + this.pageSize, this.dataTotal) + ", total " + this.dataTotal);

	var disablePrev = (this.dataOffset <= 0);
	var disableNext = (this.dataOffset + this.pageSize >= this.dataTotal);
	this.jqBtnPrev.prop("disabled", disablePrev);
	this.jqBtnNext.prop("disabled", disableNext);
	this.jqPageOffset.prop("disabled", disablePrev && disableNext);
};
