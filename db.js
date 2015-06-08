pg = require('pg');
config = require('./config.js');

db = {}; // Container for exporting whole module.
db.sites = {}; // Container for exporting site-related functions.
db.items = {} // Container for exporting item-related functions.

var conString = 'tcp://' + config.DB_USERNAME + ':' + config.DB_PASSWORD + 
                '@' + config.C9IP + ':5432/' + config.DB_NAME;

//var conString = 'tcp://bob:bob@' + config.C9IP + ':5432/simpletest';

db.client = new pg.Client(conString);

//console.log(conString);
db.client.connect();
console.log('connected to database!');

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
}

// RETURN ALL SITES IN DATABASE

db.sites.getAllSites = function(){
  var returnable = [];
  var query = db.client.query('SELECT ' + ' * from sites;');

  query.on('row', function(row){
    returnable.push(row);
    console.log('onrow, row name=' + row.name + ' city=' + row.city + 'typeof row =' + typeof row);
  });

  query.on('end', function(){
    console.log('typeof reutrnable=' + typeof returnable);
    return returnable;
  });
};

//------------------------------------------
// FUNCTIONS FOR ITEMS
//------------------------------------------

//------------------------------------------
// GENERAL FUNCTIONS
//------------------------------------------


module.exports = db;
