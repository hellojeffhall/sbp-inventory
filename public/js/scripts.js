var socket = io.connect();

var request_create = function(){};
var request_read = function(){};
var request_delete = function(){};
var request_update = function(){};

var change_view = function(){};

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
      return '<td>' + escapeHtml(temp_row[temp_heading]) + '</td>';          
    });

    return '<tr>' +  this_row.join('') + '</tr>';
  });

  document.getElementById('results_table').innerHTML = html_array_headings + 
                                             html_array.join('');
});