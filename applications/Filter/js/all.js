 var filters = null;
 var allMeasures = { "src_subject_id": [], "eventname": [] };
 var idxSubjID = 0;
 var idxVisitID = 1;
 var idxStudyDate = -1;
 var header = [ "src_subject_id", "eventname" ];

 function getAllFilters( selectThis ) {
   jQuery.getJSON('getFilter.php', function(data) {
       filters = data;
       jQuery('select.existingFilters').children().remove();
       
       // add the null filter first
       jQuery("select.existingFilters").append('<option>Predefined filters</option>');
       for (var i = 0; i < filters.length; i++) {
           var optGrp = document.createElement('optgroup');
           jQuery(optGrp).attr('label', filters[i]["name"]);
           jQuery('select.existingFilters').append(optGrp);
           for (var j = 0; j < filters[i]["rules"].length; j++) {
               jQuery(optGrp).append('<option>' + filters[i]["rules"][j]["name"] + '</option>');
           }
       }
       jQuery('.selectpickerS').selectpicker({
           style: ''
       });
       jQuery('.selectpickerS').selectpicker('refresh');
       if (selectThis !== undefined) {
           jQuery('.selectpickerS').val(selectThis);
           jQuery('.selectpickerS').selectpicker('render');
       }
       jQuery('.selectpickerS').change(function() {
           for (var i = 0; i < filters.length; i++) {
               for (var j = 0; j < filters[i]["rules"].length; j++) {
                   // The stored name of the filter can contain html characters ("<").
                   // Get the html version of the name for the comparisons.
                   var t = jQuery("<div>").append(jQuery(this).val()).html();
                   if (t == filters[i]["rules"][j]["name"]) {
                       jQuery('.inputmeasures').val(filters[i]["rules"][j]["func"]);
                       changeSearch();
                   }
               }
           }
       });
   });
 }

function highlight(where, what) {
//    return;
    // get that measure for each variable
    var idWhat = -1;
    for (var i = 0; i < header.length; i++) {
        if (what == header[i]) {
            idWhat = i;
            break;
        }
    }
    if (idWhat == -1) {
        console.log("Error: could not find " + what + " variable in the header");
        return;
    }
    var measure = new Object();
    var valueAr = {}; // get the unique values from this array
    for (var i = 0; i < allMeasures[what].length; i++) {
        valueAr[allMeasures[what][i]] = 1;
    }
    // come up with a color code for this measure, sort and use colormap
    valueAr = Object.keys(valueAr);
    
    for (var i = 0; i < allMeasures['src_subject_id'].length; i++) {
        if (!measure.hasOwnProperty(allMeasures[header[idxSubjID]][i]))
            measure[allMeasures[header[idxSubjID]][i]] = new Object();
        measure[allMeasures[header[idxSubjID]][i]][allMeasures[header[idxVisitID]][i]] = allMeasures[header[idWhat]][i];
    }
    
    jQuery(where + " .data").each(function(dat) {
        var sid = jQuery(this).attr('subjid');
        var vid = jQuery(this).attr('visitid');
        var v = valueAr.indexOf(""+measure[sid][vid]) / (valueAr.length - 1);
        var col = parseInt(8 * v); // goes from 0 to valueAr.length
        // console.log("highlight: "+dat + " " + sid + " " + vid + " " + measure[sid][vid] + " val: .q" + col + "-9");
        //jQuery(this).children().remove();
        
        if (parseFloat(measure[sid][vid]) == measure[sid][vid]) {
            jQuery('<div class="spot ' + "q" + col + "-9" + '" title="' + what + ' = ' + parseFloat(measure[sid][vid]).toFixed(2) + '"></div>').appendTo(this); // .hide().appendTo(this).fadeIn(1500);
        } else {
            jQuery('<div class="spot ' + "q" + col + "-9" + '" title="' + what + ' = ' + measure[sid][vid] + '"></div>').appendTo(this);
        }
        //jQuery(this).append('<div class="spot ' + "q" + col + "-9" + '" title="' + what + ' = ' + measure[sid][vid] + '"></div>');
    });
    
}

 // create one level of the filter
 // below - where one block should be
 function createBlock(below) {
   // organization: #below div .dataHere

   // add two rows, one for the data the other for the filter
   var d01 = document.createElement("div");
   jQuery(d01).addClass("row-fluid").css('margin-top', '10px');
   var d02 = document.createElement("div");
   jQuery(d02).addClass("row-fluid").css('margin-top', '10px');
   var d1 = document.createElement("div");
   var d2 = document.createElement("div");
   jQuery(d1).addClass("col-xs-9");
   jQuery(d2).addClass("col-xs-12");
   jQuery(d2).addClass("dataHere");
   jQuery(below).append("<div class=\"sectionTitle\" id=\"dataHereTitle\">All data points available in " + project_name + "</div>");
   jQuery(d02).append(d2);
   jQuery(below).append(d02);
   jQuery(below).append(d01);
   // now add a div for the data

   var existingFilters = document.createElement("div");
   jQuery(existingFilters).addClass('existingFilterDiv');
   jQuery(existingFilters).addClass('col-xs-3');
   var sel = document.createElement("select");
   jQuery(sel).addClass('selectpickerS');
   jQuery(sel).addClass('existingFilters');
   jQuery(sel).attr('data-live-search', 'true');
   jQuery(sel).attr('data-size', '10');
   jQuery(existingFilters).append(sel);
   jQuery(d01).append(existingFilters);

   jQuery(d01).append(d1);

   var d21 = document.createElement("div");
   //jQuery(d21).addClass("span12");
   jQuery(d21).addClass("select");
   jQuery(d1).append(d21);
   jQuery(d21).append('<div class="input-group"><input class="inputmeasures form-control" type="text" placeholder="select a predefined filter or enter your own"/><span class="input-group-addon btn" id="runFilter">&nbsp;Run</span><span class="input-group-addon btn" id="saveNewFilter">&nbsp;Save</span></div>');
   jQuery(d21).append('<div id="info"></div>')
   jQuery('#saveNewFilter').click(function() {
       var z = jQuery('.inputmeasures').val();
       if(z == ""){
         return; // nothing to do
       }
       jQuery('#save-filter-button').on('click', function() {
           console.log("save the current filter " + jQuery('#new-filter-name').val() + " " + jQuery(this).attr('filter'));
           jQuery.get('getFilter.php', { 'action': 'save', 'name': jQuery('#new-filter-name').val(),
                                         'value': jQuery(this).attr('filter').replace(/\s/g,'') }, function(data) {
               console.log(JSON.stringify(data));
               getAllFilters( jQuery('#new-filter-name').val() );
           });
       });
       
       jQuery('#save-filter-box').modal('show');
       jQuery('#save-filter-button').attr('filter', jQuery('.inputmeasures').val());
       jQuery('#new-filter-name').val(jQuery('.selectpickerS').val());
       
       //alert('not implemented yet, would have to store this as a filter');  
   });
 }

function changeSearch() {
    jQuery('.loading').show();
    // do a partial load of only the variables of interest (overwrite allMeasures)
    var requiredVariables = [ "gender", "src_subject_id", "eventname" ];
    
    // get the variables from the searchTerm
    var search = jQuery('.inputmeasures').val();
    var searchTerms = [];
    try {
        searchTerms = search.match(/[\"$]*[A-Za-z0-9_\.]+[\"\ ]*?/g).map(function(v){ return v.replace(/[\"\$]/g,''); });
    } catch(e) {};
    // create unique list of variables
    searchTerms = searchTerms.sort();
    for (var i = 1; i < searchTerms.length; i++) {
        if (searchTerms[i] == searchTerms[i-1]) {
            searchTerms.splice(i,1);
            i--;
        }
    }
    
    var languageKeywords = [ "has", "not", "and", "or", "visit", "numVisits" ];
    for (var i = 0; i < searchTerms.length; i++) {
        var idx = languageKeywords.indexOf(searchTerms[i]);
        if ( idx !== -1 || searchTerms[i] == +searchTerms[i] ) {
            searchTerms.splice(i, 1);
            i--; // check same position again because we removed one entry
        }
    }
    
    searchTermsAll = searchTerms.slice(0);
    searchTermsAll.push.apply(searchTermsAll, requiredVariables);
    // make sure we load all of them
    var promises = [];
    for (var i = 0; i < searchTermsAll.length; i++) {
        if (typeof allMeasures[searchTermsAll[i]] === 'undefined') {
            var p = addOneMeasure(searchTermsAll[i]);
            if (p !== null)
                promises.push(p);
        }
    }
    // wait for all the measures to come back before we continue
    jQuery.when.apply(jQuery, promises).then(function() {
        console.log("now we can continue with our work");
        // now we know what variables are known, lets filter searchTerms again
        var nst = [];
        for (var i = 0; i < searchTerms.length; i++) {
            if (typeof allMeasures[searchTerms[i]] !== 'undefined')
                nst.push(searchTerms[i]);
        }
        searchTerms = nst;
        jQuery('.loading').hide();    
        parse();
        jQuery('.spot').remove();
        try {
            createTermInfo(searchTerms);
        } catch(e) {};
        // create the output for this stage
        // check if output exists?
        if (jQuery('#start div .dataHere').parent().next().next().children(':first').find('.yes').length == 0) {
            var newDParent = jQuery('#start div .dataHere').parent().parent();
            var newDiv = document.createElement("div");
            jQuery(newDiv).addClass("row-fluid").css('margin-top', '-10px');
            if (jQuery('.yes').length == 0) {
                var yes = document.createElement("div");
                jQuery(yes).addClass("col-xs-6");
                jQuery(yes).addClass("yes");
                //createBlock(yes);
                // fill this block
                
                jQuery(newDiv).append(yes);
                var no = document.createElement("div");
                jQuery(no).addClass("col-xs-6");
                 jQuery(no).addClass("no");
                //createBlock(no);
                // fill this block
                
                jQuery(newDiv).append(no);
                jQuery(newDParent).append("<div class=\"row-fluid\"><div class=\"sectionTitle col-xs-12\">Result of the current restriction</div></div>");
                jQuery(newDParent).append(newDiv);
            }
        }
        jQuery('.loading').hide();
        
    }, function() {
        console.log("Error waiting for promises...");
    });     
}

// array of array in data
function displayData(data, where) {
   jQuery(where).children().remove();
   str = '<div class="datas">';
   for (var i = 0; i < data.length; i++) {
     str = str + '<div class="data" SubjID="' + data[i][idxSubjID] + 
                 '" VisitID="' + data[i][idxVisitID] + 
                 '" StudyDate="' + data[i][idxStudyDate] + 
           '" title="SubjID: ' + data[i][idxSubjID] + ', VisitID: ' + data[i][idxVisitID] + (typeof data[i][idxStudyDate]=='undefined'?"":', StudyDate: ' + data[i][idxStudyDate]) + '">' + "" + '</div>';
   }
   str = str + '</div>';
   jQuery(where).append(str);
   //jQuery(where).on('click', '.data', function(event) {
   //   showInfoWindow(event, this);
   //});
 }

function showInfoWindow(event, t) {
  var subjid = jQuery(t).attr('SubjID');
  var visitid = jQuery(t).attr('VisitID');
  var studydate = jQuery(t).attr('StudyDate');
  var title = jQuery(t).find('.spot').attr('Title');

  // create a div that we want to display inside a popup
  var popup = document.createElement('div');
  // create a unique ID for each div we create as a popup
  var numRand = Math.floor(Math.random() * 1000);
  popup.setAttribute('id', 'popup' + subjid + visitid);
  popup.className = 'highslide-html-content';

  var header = document.createElement('div');
  header.className = 'highslide-header';
  popup.appendChild(header);
  var headerList = document.createElement('ul');
  header.appendChild(headerList);
  var entry = document.createElement('li');
  headerList.appendChild(entry);
  entry.className = 'highslide-close';
  var closeLink = document.createElement('a');
  entry.appendChild(closeLink);
  closeLink.setAttribute('href', '#');
  closeLink.setAttribute('title', '{hs.lang.closeTitle}');
  closeLink.setAttribute('onclick', 'return hs.close(this)');
  var closeLinkSpan = document.createElement('span');
  closeLink.appendChild(closeLinkSpan);
  closeLinkSpan.innerHTML = '{hs.lang.closeText}';

  var popupBody = document.createElement('div');
  popupBody.className = 'highslide-body';
  popupBody.setAttribute('margin-top', '30px');
  popup.appendChild(popupBody);
  var popupBodyDiv = document.createElement('div');
  //popupBodyDiv.setAttribute('style', 'float: right; width: 110px; margin: 4px;');
  popupBody.appendChild(popupBodyDiv);
  var can = document.createElement('div');
  popupBodyDiv.appendChild(can);
  can.setAttribute('id', 'sliceCanvas' + subjid + visitid);
  jQuery(can).append("<br/><span>SubjID:" + subjid + "</span><br/>");
  jQuery(can).append("<span>VisitID:" + visitid + "</span><br/>");
  jQuery(can).append("<span>StudyDate:" + studydate + "</span><br/>");
  jQuery(can).append("<span>" + title + "</span><br/>");
  document.getElementById('place-for-popups').appendChild(popup);
  var te = document.createElement('div');
  te.setAttribute('id', 'text' + subjid + visitid);
  var txtNode = document.createTextNode("");

  te.appendChild(txtNode);
  popupBody.appendChild(te);
  var footer = document.createElement('div');
  footer.className = 'highslide-footer';
  popup.appendChild(footer);
  var span = document.createElement('span');
  span.className = 'highslide-resize';
  span.setAttribute('title', '{hs.lang.resizeTitle}');
  footer.appendChild(span);

  hs.htmlExpand(null, {
    pageOrigin: {
      x: event.pageX,
      y: event.pageY
    },
    contentId: 'popup' + subjid + visitid,
    headingText: 'Subject info', // + ' (' + gender + ')',
    width: 310,
    height: 190
  });
 }

 function createTermInfo( searchTerms ) {
   // look through allMeasures
   var infoStr = "";
   jQuery('#info').html(infoStr);
   searchTerms.forEach( function(t) {

     var idWhat = -1;
     for (var i = 0; i < header.length; i++) {
       if (t == header[i]) {
         idWhat = i;
         break;
       }
     }
     if (idWhat == -1) {
       infoStr = infoStr + "<div class=\"info\"><span>"+t+" is unknown</span></div>";      
       return;
     }

     var min = +allMeasures[header[idWhat]][0];
     var max = min;
     if (isNaN(min)) {
        min = allMeasures[header[idWhat]][0];
        max = "";
        // search for the next entry
        for (var i = 1; i < allMeasures['src_subject_id'].length; i++) {
          if (allMeasures[header[idWhat]][i] !== "" && allMeasures[header[idWhat]][i] !== min) {
              max = allMeasures[header[idWhat]][i]; // just show the first two as examples 
              break;
          }
        }
     } else {
         for (var i = 0; i < allMeasures['src_subject_id'].length; i++) {
             if (!isNaN(allMeasures[header[idWhat]][i])) {
                 if (min > allMeasures[header[idWhat]][i])
                     min = +allMeasures[header[idWhat]][i];
                 if (max < allMeasures[header[idWhat]][i])
                     max = +allMeasures[header[idWhat]][i];
             }
         }
         min = parseFloat(min).toFixed(2);
         max = parseFloat(max).toFixed(2);
     }
     infoStr = infoStr + "<div class=\"info\"><span>" + t + "</span> <span> " + min.toString() + "</span>...<span>" + max.toString() + "</span></div>";
   });
   jQuery('#info').html(infoStr);
 }

function parse() {
    jQuery('.dataHere').hide();
    jQuery('#dataHereTitle').hide();
    // delete the dataHere block
    jQuery('.dataHere').children().remove();
    // try peg library
    // we will apply the rules to each data entry and generate an output array
    var searchTerm = jQuery('.inputmeasures').val();
    jQuery('.loading').show();
    jQuery.get('js/grammar_vectorized.txt?_=113', function(data) {
        var parser;
        try {
            parser = PEG.buildParser(data);
        } catch(e) {
            alert('Parser is invalid: ' + e);
            jQuery('.loading').hide();
        }
        var yes = [];
        var no = [];
        // Do a single vectorized parse step (should speed things up).
        // The return can be a scalar as in has(age).
        var res = [];
        try {
            res = parser.parse(searchTerm);
        } catch(e) {
            jQuery('.loading').hide();
            alert("Error: Invalid filter, please check your syntax. Detailed error message: " + e.message);
            return false;
        }           
        for (var i = 0; i < allMeasures['src_subject_id'].length; i++) {
            var d = Array.apply(null, new Array(header.length)).map(function(){return 0;});
            for (var j = 0; j < header.length; j++) {
                d[j] = allMeasures[header[j]][i];
            }
            var tf = false;
            if (res.constructor === Array && res.length == allMeasures['src_subject_id'].length) {
                tf = res[i];
            } else {
                tf = res;
            }
            
            if (tf === true) {
                yes.push(d);
            } else {
                no.push(d);
            }
        }
        console.log('number of yes/no: ' + yes.length + " " + no.length);
        displayData(yes, ".yes");
        displayData(no, ".no");
        
        // add Yea and Nay fields
        var yea = jQuery(document.createElement("div")).addClass("Yea");
        var nay = jQuery(document.createElement("div")).addClass("Nay");
        jQuery('.yes').append(yea);
        jQuery('.no').append(nay)
        
        var SubjIDIDX = header.indexOf("src_subject_id");
        var VisitIDIDX = header.indexOf("eventname");
        if (SubjIDIDX == -1) {
            alert("Error: could not find a src_subject_id entry");
        }
        
        var yesSubjects = [];
        for(var i = 0; i < yes.length; i++) {
            if (VisitIDIDX > -1) {
                yesSubjects.push([ yes[i][SubjIDIDX], yes[i][VisitIDIDX] ]); // append the SubjID and the VisitID
            } else {
                yesSubjects.push( yes[i][SubjIDIDX] ); 
            }
        }
        yesSubjects = jQuery.unique(yesSubjects);
        var numYesSubjects = jQuery.unique(yesSubjects.map(function(e) { if (e.length == 2) return e[0]; else return e; })).length;
        
        var noSubjects = new Array();
        for(var i = 0; i < no.length; i++) {
            if (VisitIDIDX > -1) {
                noSubjects.push([ no[i][SubjIDIDX], no[i][VisitIDIDX] ]);
            } else {
                noSubjects.push( no[i][SubjIDIDX] );
            }
        }
        noSubjects = jQuery.unique(noSubjects); // we can have the same subject with multiple VisitIDs, but together they should be unique
        var numNoSubjects = jQuery.unique(noSubjects.map(function(e) { if (e.length == 2) return e[0]; else return e; })).length;
        
        // we should get a key for this selection (either Yea or Nay)
        // lets make the key dependent on the search string - will provide us with less files to worry about
        var uniqueIDY = hex_md5(project_name + jQuery('.inputmeasures').val().replace(/\s/g,'') + "YES").slice(-4);
        //var uniqueIDY = ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
        var uniqueIDN = hex_md5(project_name + jQuery('.inputmeasures').val().replace(/\s/g,'') + "NO").slice(-4);
        //var uniqueIDN = ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);

        if (yes.length > 0) {
            jQuery('.Yea').html("Yea: " + yes.length.toLocaleString() + "<br/><small title=\"Use this key to reference the set of subjects for which the filter is true.\">key: #" +
                                uniqueIDY + "</small>").attr('title', yes.length.toLocaleString() + ' sessions for which the filter "' + uniqueIDY + '" is true (#subjects: '+ numYesSubjects+')');
            jQuery('.Yea').draggable();
        }
        if (no.length > 0) {
            jQuery('.Nay').html("Nay: " + no.length.toLocaleString()).attr('title', no.length.toLocaleString() + ' sessions for which the filter "' + uniqueIDN + '" is false (#subjects: '+ numNoSubjects+')');
            jQuery('.Nay').draggable();
        }
        // store this as subset
        jQuery.ajax({
            type: "POST",
            url: 'saveAsSubset.php',
            data: {
                project_name: project_name,
                key: uniqueIDY,
                set: yesSubjects,
                code: jQuery('.inputmeasures').val().replace(/\s/g,''),
                which: 'yes'
            }
        }).done(function(msg) {
            // alert(msg);
            console.log("after store this subset Yes");
        }).fail(function(msg) {
            alert('error');
            jQuery('.loading').hide();
        });
        
/*        jQuery.ajax({
            type: "POST",
            url: 'saveAsSubset.php',
            data: {
                project_name: project_name,
                key: uniqueIDN,
                set: noSubjects,
                code: jQuery('.inputmeasures').val().replace(/\s/g,''),
                which: 'no'
            }
        }).done(function(msg) {
            // alert(msg);
            console.log("after store this subset No");
        }).fail(function(msg) {
            alert('hi ' + msg);
            jQuery('.loading').hide();
        }); */
        
        var search = jQuery('.inputmeasures').val();
        var variables = [];
        try {
            variables = search.match(/[\"\$]*[A-Za-z0-9_\.]+[\"\ ]*?/g).map(function(v){ return v.replace(/[\"\$]/g,''); });
        } catch(e) {};
        
        // create unique list of variables
        variables = variables.sort();
        for (var i = 1; i < variables.length; i++) {
            if (variables[i] == variables[i-1]) {
                variables.splice(i,1);
                i--;
            }
        }
        
        var languageKeywords = [ "has", "not", "and", "or", "visit", "numVisits" ];
        for (var i = 0; i < variables.length; i++) {
            var idx = languageKeywords.indexOf(variables[i]);
            if ( idx !== -1 || variables[i] == +variables[i]) {
                variables.splice(i, 1);
                i--; // check same position again because we removed an entry
            }
        }
        
        if (variables.length == 0) {
            variables.push("src_subject_id");
        }
        variables.forEach( function(v) { 
            highlight('.yes', v);
        });
        variables.forEach( function(v) { 
            highlight('.no', v);
        });
        jQuery('.loading').hide();        
    });
}

// some variables are not measures (like "M"), only try to pull those once and remember them to be bad
var noMeasureList = ["M", "F"];

// pull only the data we need (allMeasures as a dictionary of columns)
function addOneMeasure( meas ) {
    // maybe this measure is already in allMeasures?
    if (Object.keys(allMeasures).indexOf(meas) > -1) {
        return null; // nothing needs to be done, measure exists already
    }
    if (noMeasureList.indexOf(meas) > -1) {
        return null; // nothing can be done, its a no-measure
    }
    
    // ask the system to return this measure and add it to allMeasures (if it does not exist already)
    return jQuery.getJSON('runR.php', { 'value': meas }, function(data) {
        // got the values, now add to allMeasures (merge with existing)
        var k  = Object.keys(allMeasures);
        k.splice(k.indexOf('src_subject_id'),1);
        k.splice(k.indexOf('eventname'),1);
        var ids    = data[0]; // each of these are arrays
        var event  = data[1];
        var v = null;
        if (data.length > 2 && data[2] != null) {
            v = data[2];
        } else {
            noMeasureList.push(meas);
            return; // this is not a real variable, don't use this one
        }
        allMeasures[meas] = []; // empty, fill in the values
        header.push(meas);
        for (var i = 0; i < ids.length; i++) {
            var found = false;
            for (var j = 0; j < allMeasures['src_subject_id'].length; j++) {
                if (allMeasures['src_subject_id'][j] == ids[i]) {
                    if (allMeasures['eventname'][j] == event[i]) {
                        found = true;
                        // add the value here
                        allMeasures[meas][j] = v[i];
                        break;
                    }       
                }
            }
            if (!found) {
                // add a new entry to all keys at the end
                var lastidx = allMeasures['src_subject_id'].length;
                allMeasures['src_subject_id'][lastidx] = ids[i];
                allMeasures['eventname'][lastidx]      = event[i];
                allMeasures[meas][lastidx]             = v[i];
                for (var j = 0; j < k.length; j++) {
                    allMeasures[k[j]] = None;
                }
            }
        }
    });
}

jQuery(document).ready(function() {
    jQuery('.project_name').text(project_name);
    createBlock('#start');
    getAllFilters();
    jQuery('#dataHereTitle').hide();
    // don't react to change, we will get a change on loosing focus, only react to hitting the enter key
    jQuery('.inputmeasures').on('keypress', function(e) {
        if (e.keyCode == 13)
            changeSearch();
    });
    jQuery('#runFilter').on('click', function() {
        var text = jQuery('.inputmeasures').text();
        if (text == "") {
            alert("No filter selected. Start by either selecting a predefined filter from the drop-down, or by typing in a new filter.");
            return;
        }
        changeSearch();
    });
    setTimeout(function() { addOneMeasure('age'); }, 0);
});
