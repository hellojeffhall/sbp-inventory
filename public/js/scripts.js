var socket = io.connect();

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

var change_view = function(){};

var pending_edits = [];

var edit_begin =  function(item_to_edit){
  // This should be called when a user clicks the "edit" button on 
  // a row in list view, or when the user clicks the "edit" button
  // on a record in detail view.
  //
  // This will add the current row/record's primary key to an array
  // of pending edits, so that when edits are committed we will know
  // what needs to be sent to the database for update requests.
  //
  // In addition, as a future feature we can use this array to 
  // warn users when they are about to do something that would lose
  // their pending edits, e.g., navigate away without hitting a save/commit 
  // button.

  // TODO
  //
  // Check to see if the value is already in the array.
  // Remove the edit button and show a cancel and save button.
  // Maybe we should only allow editing of one row at a time? 
  // Record the column that is being edited and the new value
  var primary_key_to_edit = item_to_edit.getAttribute('data-pk');
  
  console.log("Before: " + JSON.stringify(pending_edits));
  
  pending_edits.push({
      primary_key : primary_key_to_edit
//    primary_key :primary_key,
//    column_name_db : column_name_db,
//    new_value : new_value
  });

  console.log("After: " + JSON.stringify(pending_edits));
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

var escapeHtml = function(str){
  //
  // Borrowed this function from:
  // http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
  //
var div = document.createElement('div');
div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

socket.on('update_results', function(data){

  var headings = data.column_headings; // Array of column headings.
                                       // We should figure out how to have a display
                                       // name for each.
  var html_array_headings = '<tr>' +
    headings.map(function(temp_heading){
      return '<th>' + temp_heading + '</th>';
      }).join("") +
    '</tr>';

  var rows = data.rows;                // Array of rows to display.
                                       // Each row object should have a "column_name_db"
                                       // property as well as a "value" property.
                                       // This way, we know what to display
                                       // and under which column.

  var html_array = rows.map(function(temp_row){

    var this_row = headings.map(function(temp_heading){
      // "temp_row" is based on user-entered information, and needs
      // to be escaped before it can be displayed.
      return '<td contenteditable>' + escapeHtml(temp_row[temp_heading]) + '</td>';          
    });

    //return '<tr data-pk='+ escapeHtml(temp_row.zz_id) +' > ' +  this_row.join('') + '</tr>';
    var finalToReturn = '<tr> ' +  this_row.join('') + '</tr> <button data-pk='+ escapeHtml(temp_row['Site ID']) +' onclick="edit_begin(this)">Edit</button>';
//    console.log(JSON.stringify(finalToReturn));
    return finalToReturn;
  });

  document.getElementById('results_table').innerHTML = html_array_headings + 
                                             html_array.join('');
});