var pg = require('pg');
var config = require('./config.js');

var db = {}; // Container for exporting whole module.
db.sites = {}; // Container for exporting site-related functions.
db.items = {} // Container for exporting item-related functions.

var conString = 'tcp://' + config.DB_USERNAME + ':' + config.DB_PASSWORD + 
                '@' + config.C9IP + ':5432/' + config.DB_NAME;

db.client = new pg.Client(conString);

db.client.connect();
//console.log('connected to database!');

//------------------------------------------
// FUNCTIONS FOR SITES
//------------------------------------------

// CREATE NEW SITE IN DATABASE

db.sites.newSite = function(args){

  // TODO - what happens if a user doesn't provide all necessary arguments?
  //
  // Pass in an object for arguments. The object MUST contain:
  //
  // name : the name of the site.
  // address_line_1 :
  // address_line_2 : please set the value to this key as '' if not needed.
  // city : 
  // state :
  // zip :  
  // 

  if ( args.name && args.address_line_1 && args.city && args.state && args.zip){
    db.client.query(
      'insert into SITES ' +
      '(name, address_line_1, address_line_2, city, state, zip) ' +
      ' values ($1, $2, $3, $4, $5, $6);',
      [args.name, args.address_line_1, args.address_line_2, args.city, args.state, args.zip]
    );
  }
  else{
    return 'fail';
  }
};

// RETURN ALL SITES IN DATABASE

// db.getAllSites = function(callback_on_end){
  
//   // TOMOVE
//   // An individual view should be able to choose which
//   // columns will be displayed, based on the privledge
//   // set that the server determined the user to have.
//   //
//   // The database should only be responsible for returning
//   // an array of row ojects, where each row object
//   // has keys for each database column name and
//   // the values that correspond to those columns for this record.
  
//   var col_to_return_array = [
//     {name_col : 'name', name_display : 'Site Name'},
//     {name_col : 'address_line_1', name_display : 'Address Line 1'},
//     {name_col : 'address_line_2', name_display : 'Address Line 2'},
//     {name_col : 'city', name_display : 'City'},
//     {name_col : 'state', name_display : 'State'},
//     {name_col : 'zip', name_display : 'Zip Code'} ,
//     {name_col : 'zz_id', name_display : 'Site ID'} 
//   ];
//   var col_to_return_string = col_to_return_array.map(function(temp_col){
//     return temp_col.name_col + ' as \"' + temp_col.name_display + '\"';
//   }).join(", ");

//   var query = db.client.query('SELECT ' + col_to_return_string + ' from sites;');
//   query.on('row', function(row, result){
//     result.addRow(row);
//   });

//   query.on('end', function(result){
//     var column_headings_array = result.fields.map(function(field){
//       return field.name;
//     });
//     // Calls the callback function, passing an object containing two arrays.
//     // The first is an array of column headings.
//     // The second is an array of rows that were returned.
//     //console.log('db.js: query result: ' + JSON.stringify(result));
//     //console.log('now calling callback');
//     callback_on_end({column_headings : column_headings_array, rows : result.rows});
//   });
// };


db.simple_select = function(view_object, criteria, final_callback){
    
  // Array of column objects representing the columns that we want to fetch.
  var columns_array = view_object.columns;
  
  // Produce the portion of the SELECT clause that is made up of 
  // the fully-qualified column names.

  var clause_select = columns_array.map(function(temp_column){
    return temp_column.table_name_db + '.' + temp_column.col_name_db;
  }).join(', ');

  // Table for the "FROM" part of the query.  
  var from_table = view_object.base_table;

  // Make sure that we were given some criteria. If we were not, 
  // just return all rows. Maybe in the future we want to limit this to a 
  // certain number of rows.
  
  var clause_where = (criteria != null && criteria !='') ?  criteria : '1=1';

  var query_string = 'SELECT ' + 
                          clause_select +  
                      ' FROM ' + 
                          from_table +
                      ' WHERE ' + 
                          clause_where + ';';
                          
                         
  var query = db.client.query(query_string);

  query.on('row', function(row, result){
    result.addRow(row);
  });

  query.on('end', function(result){
    
    // Array of display names for the columns. We will need this for when the 
    // view renders.
    var col_names_display = columns_array.map(function(temp_col){
      return temp_col.col_name_display;
    });

    var col_names_db = columns_array.map(function(temp_col){
      return temp_col.col_name_db;
    });

    // Calls the callback function, passing
    // a) an array of the objects that represent rows returned, 
    // b) an array of the display names of the returned rows, and
    // c) the template to render
    final_callback(result.rows, col_names_display, col_names_db, view_object.template_name);
  });
};

//------------------------------------------
// FUNCTIONS FOR ITEMS
//------------------------------------------

//------------------------------------------
// GENERAL FUNCTIONS
//------------------------------------------

module.exports = db;
