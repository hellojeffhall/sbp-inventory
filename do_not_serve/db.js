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

db.getAllSites = function(caller_socket, whatToEmit){
  
  var col_to_return_array = [
    {name_col : 'name', name_display : 'Site Name'},
    {name_col : 'address_line_1', name_display : 'Address Line 1'},
    {name_col : 'address_line_2', name_display : 'Address Line 2'},
    {name_col : 'city', name_display : 'City'},
    {name_col : 'state', name_display : 'State'},
    {name_col : 'zip', name_display : 'Zip Code'} ,
    {name_col : 'zz_id', name_display : 'Site ID'} 
  ];
  var col_to_return_string = col_to_return_array.map(function(temp_col){
    return temp_col.name_col + ' as \"' + temp_col.name_display + '\"';
  }).join(", ");

  var query = db.client.query('SELECT ' + col_to_return_string + ' from sites;');
  query.on('row', function(row, result){
    result.addRow(row);
  });

  query.on('end', function(result){
    var column_headings_array = result.fields.map(function(field){
      return field.name;
    });
    // Return an object containing two arrays.
    // The first is an array of column headings.
    // The second is an array of rows that were returned.
    return {column_headings : column_headings_array, rows : result.rows};
  });
};

//------------------------------------------
// FUNCTIONS FOR ITEMS
//------------------------------------------

//------------------------------------------
// GENERAL FUNCTIONS
//------------------------------------------

module.exports = db;
