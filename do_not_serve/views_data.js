var db = require('./db.js');
var server = require('./server.js');

var views_data = {}; // This module contains an array of view objects, 
                     // where each view object contains data about that view,
                     // e.g.columns to show in that view, who is connected 
                     // to that view, etc.

views_data.process_view_request = function(view_name, criteria, final_callback){
    //
    // Take in a view name and a callback, and passes to the database the 
    // view object that corresponds to the view name.
    // (Later, we will also be able to define
    // criteria for the query, using the criteria object.)
    // The database will perform a SELECT query on the columns listed
    // in the view object, and perform the callback on query end.
    
    // Get the data about the given view.
    var view_object = views_data.views[view_name];
    
    // For now, this will only work with no criteria, e.g., show all sites.
    // We will have to figure out a way to send criteria to the database to get
    // a particular site, item, etc. Maybe an object
    db.simple_select(view_object, criteria, final_callback);
  
};

views_data.build_clause_select = function(array_of_column_objects){
    //
    // Take the array of columns and produce a string that the database
    // can use as its SELECT clause. E.g.,
    // SELECT <<table.column, table.column, table.column>> FROM <<base_table>>
    //
    // Then pass the string on to the query function and have the database
    // run the query. 
    //
    return array_of_column_objects.map(function(this_col_obj){
        return this_col_obj.table_name_db + '.' + this_col_obj.col_name_db;
    });
};

views_data.change_view = function(socket_id, view_from, view_to){
    // 
    // Remove this socket_id from the list of current sockets in the 
    // view called "view_from" and add it to "view_to."
    // It is possible for both the from and to fields to be null,
    // in which case that poriton of the function won't need to be
    // executed. They might be null/undefined if we are adding 
    // the socket for the first time, or if the socket disconnected.
    //
    if(view_from != null){
        var sockets_array_from = views_data.views[view_from].current_sockets;
        var position = sockets_array_from.indexOf(socket_id);
        sockets_array_from.splice(position,1);
    }
    if(view_to != null){
        views_data.views[view_to].current_sockets.push(socket_id);
    }
};

views_data.views = {
    //
    // SAMPLE VIEW OBJECT
    //
    //view_name_internal : {
    //     view_name_display : 'Display Version of View Name',
    //     priv_sets : ['admin'],
    //     template_name : 'blah.jade',
    //     base_table : 'blahblah'
    //     columns : [
    //         { 
    //             col_name_display : '' , 
    //             col_name_db : '' , 
    //             table_name_db : ''
    //         },
    //         { 
    //             col_name_display : '' , 
    //             col_name_db : '' , 
    //             table_name_db : ''
    //         },
    //         { 
    //             col_name_display : '' , 
    //             col_name_db : '' , 
    //             table_name_db : ''
    //         },   
    //     ],
    //     current_sockets : ['','','']
    // },
    
    // ------------------------------------------
    // SITE VIEWS
    // ------------------------------------------
    
    site_detail : {
        view_name_display : 'Site Detail',
        priv_sets : ['admin'],
        template_name : 'site_detail.jade',
        base_table : 'sites',
        columns : [
            { 
                col_name_display : 'Site Name' , 
                col_name_db : 'name' , 
                table_name_db : 'sites'
            },
            { 
                col_name_display : 'Address Line 1' , 
                col_name_db : 'address_line_1' , 
                table_name_db : 'sites'
            },
            { 
                col_name_display : 'Address Line 2' , 
                col_name_db : 'address_line_2' , 
                table_name_db : 'sites'
            },   
            { 
                col_name_display : 'City' , 
                col_name_db : 'city' , 
                table_name_db : 'sites'
            },   
            { 
                col_name_display : 'State' , 
                col_name_db : 'state' , 
                table_name_db : 'sites'
            },   
            { 
                col_name_display : 'Zip Code' , 
                col_name_db : 'zip' , 
                table_name_db : 'sites'
            },            
            { 
                col_name_display : 'Site ID' , 
                col_name_db : 'zz_id' , 
                table_name_db : 'sites'
            },   
        ],
        current_sockets : []
    },    
    
    site_list : {
        view_name_display : 'Site List',
        priv_sets : ['admin'],
        template_name : 'generic_list.jade',
        base_table : 'sites',
        columns : [
            { 
                col_name_display : 'Site Name' , 
                col_name_db : 'name' , 
                table_name_db : 'sites'
            },
            { 
                col_name_display : 'Address Line 1' , 
                col_name_db : 'address_line_1' , 
                table_name_db : 'sites'
            },
            { 
                col_name_display : 'Address Line 2' , 
                col_name_db : 'address_line_2' , 
                table_name_db : 'sites'
            },   
            { 
                col_name_display : 'City' , 
                col_name_db : 'city' , 
                table_name_db : 'sites'
            },   
            { 
                col_name_display : 'State' , 
                col_name_db : 'state' , 
                table_name_db : 'sites'
            },   
            { 
                col_name_display : 'Zip Code' , 
                col_name_db : 'zip' , 
                table_name_db : 'sites'
            },            
            { 
                col_name_display : 'Site ID' , 
                col_name_db : 'zz_id' , 
                table_name_db : 'sites'
            },   
        ],
        current_sockets : []
    } 
};

module.exports = views_data;