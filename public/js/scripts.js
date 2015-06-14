var socket = io.connect();  // io is defined in a script that is called
                            // prior to this script loading.
                            //
var state = {};             // For recording things realted to state.
                            // E.g., current table.
                            // Maybe we can use this at some point to create
                            // "links" so that people can come back to 
                            // where they were.
//------------------------------------------------------------------------------
// BEGIN: UTILITY FUNCTIONS
//------------------------------------------------------------------------------
var utils = {};

utils.escapeHtml = function(str){
  //
  // Borrowed this function from:
  // http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
  //
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

utils.objectFinder = function (array_to_search, property_to_inspect, value_to_find ){
  //
  // A function to find the position of the first object
  // in an array to have a certain property with a certain value.
  // If the object isn't found, return -1.
  //
  for(var i=0; i++; i<array_to_search.length){
    if(array_to_search[i].property_to_inspect === value_to_find){return i;}
  }
  return -1;
};

utils.updateState=function(table_name, view_mode, data){
  state.table = table_name;
  state.view_mode = view_mode;
  state.data = data;
  document.getElementById('current_view').innerHTML= state.table + ' ' + state.view_mode;
};

utils.setInitialStateIfNeeded = function(data){
  if(!state.table||!state.data||!state.view_mode)
  utils.updateState("sites","list", data);
};


//------------------------------------------------------------------------------
// END: UTILITY FUNCTIONS
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// BEGIN: VIEWS
//------------------------------------------------------------------------------
var views = {};             // Stuff related to views
views.listView = {};        // Stuff related to list views. 
                            // List view is generic, so we don't really need
                            // subfolders.
                            //
views.detailView = {};      // Stuff related to detial views.
                            // Individual detail views might need very different
                            // things, so we'll use subfolders to keep those 
                            // organized.
                            //
views.detailView.sites = {} // Stuff for site detail views.
views.detailView.items = {} // Stuff for item detail views.

views.change_view = function(table_name, view_mode, query_info){
// table_name   
//    Can be "sites"
//
// mode
//    Can be "list" or "detail"
//
// query_info
//    For detail, should be a "this" with a data-pk attribute, from which we
//    can get the primary key of the item that we want to show you.
//    For list, should be the object required to load the list view (see that 
//    function for more details)

  
  if(view_mode==='detail'){
    var primary_key = query_info.getAttribute('data-pk');
    
    if(table_name==='sites'){
      utils.updateState(table_name, view_mode, primary_key);
      views.detailView.sites.loadView(primary_key);
    }
  }
  else if(view_mode==='list'){
    utils.updateState(table_name, view_mode, query_info);
    views.listView.loadView(query_info);
  }
};
//------------------------------------------------------------------------------
// BEGIN: VIEWS: LIST
//------------------------------------------------------------------------------

views.listView.loadView = function(data){
  // Should be called with one argument, an object containing...
  
  var headings = data.column_headings;  // Array of column headings.
                                        // We should figure out how to have a display
                                        // name for each.
  var html_array_headings = '<tr>' +
    headings.map(function(temp_heading){
      return '<th>' + temp_heading + '</th>';
      }).join("") +'</tr>';

  var rows = data.rows;                // Array of rows to display.
                                      // Each row object should have a "column_name_db"
                                      // property as well as a "value" property.
                                      // This way, we know what to display
                                      // and under which column.

  var html_array = rows.map(function(temp_row){

    var this_row = headings.map(function(temp_heading){
      // "temp_row" is based on user-entered information, and needs
      // to be escaped before it can be displayed.
      return '<td contenteditable="false" data-col='+ utils.escapeHtml(temp_row[temp_heading]) +' onblur="edit_value(this)">' + utils.escapeHtml(temp_row[temp_heading]) + '</td>';          
    });

    //return '<tr data-pk='+ utils.escapeHtml(temp_row.zz_id) +' > ' +  this_row.join('') + '</tr>';
    var finalToReturn = "<tr>" +  
                          this_row.join('') +
                          "<td>" +
                            "<button data-pk='"+ 
                              utils.escapeHtml(temp_row['Site ID']) +
                              "' onclick='views.change_view(&quot;"
                              +state.table.trim()+ 
                              "&quot;, &quot;detail&quot;, this)'>View" + 
                            "</button>" + 
                          "</td>"+
                        "</tr>";
    //<button data-pk='+ utils.escapeHtml(temp_row['Site ID']) +' onclick="edit_begin(this)">Edit</button>';

    return finalToReturn;
  });

  document.getElementById('results_table').innerHTML = html_array_headings + html_array.join('');
};

//------------------------------------------------------------------------------
// END: VIEWS: LIST
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// BEGIN: VIEWS: DETAIL
//------------------------------------------------------------------------------
views.detailView.sites.loadView = function(primary_key){
  alert('This is where you would be brought to the "detail" view for site w/ ID=' + primary_key + '.');
};



var edit_begin =  function(button_clicked){
  //
  // This should be called when a user clicks the "edit" button on 
  // a record in detail view.
  //
};

// An array contianing objects that represent edits (possibly) made.
var pending_edits = [];

var edit_value = function(td_edited){
  // Whenever the user is in edit more on a row, 
  // if a <td> is blurred, the user was definitely 
  // in the <td>, so there is a chance that the user edited
  // it. So, we should record which database column was 
  // possibly edited for this record--that way, we don't 
  // have to request that the database update all columns
  // for this record.
  //
  // At the same time, we'll create an object to represent
  // the possible change, including the column that was
  // possibly changed and the value of that column.
  //
  var to_edit_col = td_edited.getAttribute('data-col');
  var to_edit_value = td_edited.innerHtml;
  
  var col_already_at = utils.objectFinder(pending_edits,'col',to_edit_col);
  
  if(col_already_at>=0){
    //The column already exists--replace the value of the edit object.
    console.log("Updating value of " + pending_edits[col_already_at].value);
    pending_edits[col_already_at].value = to_edit_value;
    console.log("New value " + pending_edits[col_already_at].value);
  }
  else{
    // This column does not yet exist in our array.
    // We'll have to make new object representing the possible change.
    var possible_change = {
      col: to_edit_col,
      value: to_edit_value
    };
    pending_edits.push(possible_change);
    console.log('adding a new possible change: ' + JSON.stringify(possible_change));
  }
};

var edit_cancel =  function(){
  // This should be called when a user is editing a record and clicks 
  //the "cancel" button on a row in list view, or when the user clicks 
  // the "cancel" button on a record in detail view.
  //
  // This will remove the current row/record's primary key to an array
  // of pending edits, which exits so that when edits are committed we will 
  // know what needs to be sent to the database for update requests.
  //

};
//------------------------------------------------------------------------------
// END: VIEW: DETAIL
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// END: VIEWS
//------------------------------------------------------------------------------



var request_create = function(){};
var request_read = function(){};
var request_delete = function(){};
var request_update = function(){
  //
  // Should be passed an array of updates to make.
  // So, if the user edits multiple records before hitting "save",
  // We can update all of those records at once.
  //
  // Each array element should contain an object representing a row
  // to be edited.
  // The object must have the following properties: 
  
  // primary_key 
  // column_name_db
  // new_value
  //
};
socket.on('update_results', function(data){
  utils.setInitialStateIfNeeded(data);
  views.change_view(state.table, state.view_mode, state.data);
});