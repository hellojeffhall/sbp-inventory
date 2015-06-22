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
  var query_string = '';
  var query = '';
  
  if(typeof criteria.pk != 'undefined') {
    // We were given a primary key, so retrieve just that record.
    // For now, we are assuming that the presence of a primary key indicates
    // that we want to get only a single record, like for a detail view.
    query_string = 'SELECT ' + clause_select +  
                      ' FROM ' + from_table +
                      ' WHERE ' + from_table + '.zz_id' + ' =$1 ;';
    query = db.client.query(query_string , [parseInt(criteria.pk,10)]);

  }
  else{
    // Otherwise, assume that we are getting all records in a table, probably
    // for a list view.
    query_string = 'SELECT ' + clause_select +  
                      ' FROM ' + from_table;
    query = db.client.query(query_string);
  }
  
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
