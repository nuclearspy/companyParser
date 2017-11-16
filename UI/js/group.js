function GroupItem(json) {
    this.group_no = json ? json.group_no : null;
    this.group_name_list = json ? json.group_name_list : null;

    this.rawJSON = function () {
        return {
            'group_no': this.group_no,
            'group_name_list': this.group_name_list,
        }
    }
}

function CompanyItem(array){
    this.company_name=array[0];
    this.taxcode=array[1];

}

function parseGroups(data) {
    var parsed_groups = [];
    var parsed_company = {};
    $.each(data, function (index, dict) {
        parsed_groups.push(new GroupItem(dict));
        var parsed_company_list =[];
        
        $.each(dict['company_list'], function (index, array) {
            parsed_company_list.push(new CompanyItem(array))
        });   

        parsed_company[dict['group_no']]=parsed_company_list;
    });

    return [parsed_groups, parsed_company];
}

var group_api={
    
    'hideall': function(){
        $('#group_query_area').css('display','none');
        $('#table_query_body').empty();
        $('#company_name').val('');
        group_table.hide();
        company_table.hide();
    },

    'query': function(){
        this.hideall();
        if ($('#relation_graph').is(":checked")){
            console.log("go relation_graph")
            this.query_list();
        }
        else if ($('#relation_query').is(":checked")){
            console.log("go relation_query")
            $('#group_query_area').css('display','inline-block');
        }    
    },

    'query_list':function(){
        var year=$('#year').val();
        
        req_ajax({
            url: web_url+"/group/list/query",
            data: {
                "year": year
            },
            success: function(data){
                result = parseGroups(data);
                var group_table_element = $('#table_group');
                group_table.groupItems=result[0];
                company_table.companyItems=result[1];
                group_table.loadData(group_table_element, result[0]);
                group_table.show();
                company_table.hide();
            },
            error: function (data) {
            }
        }); 
    },

    'query_parent':function(){
        var company_name=$('#company_name').val();
        
        req_ajax({
            url: web_url+"/group/parent/query",
            data: {
                "company_name": company_name
            },
            success: function(data){
                $('#table_query_body').empty();
                if (data['errorCode']!=0){
                    $('#query_error_msg').text(data['error']);
                }
                else{
                    $('#query_error_msg').text('');
                    var row='<tr role="row" class="odd">'
                    row +='<td class="sorting_1">'+data['result'][0]['group_no']+'</td>'
                    row +='<td class="sorting_1">'+data['result'][0]['group_name']+'</td>'
                    row += '</tr>'
                    $('#table_query_body').append(row);
                }
               
            },
            error: function (data) {


            }
        }); 
    }    

}

var company_table={
    'companyItems': {},
    'table_element': $('#table_company'),

    'init': function (table) {
        var _table = table.DataTable({
            autoWidth: false,
            columns: [
                {data: "company_name"},
                {data: "taxcode"}
            ],
            order: [[0, 'asc']],
            dom: 'Bfrtlip',
            columnDefs: [{
                'targets': 0,
                'searchable': true,
                'orderable': true,
                'width': '1%',
                'render': function (data, type, full, meta) {
                    return '<td class="sorting_1">'+data+'</td>';
                }
            }],
            buttons:[{
                text: "<i class='glyphicon glyphicon-menu-left'></i>回上頁" ,
                action: function (e, dt, node, config) {
                    company_table.hide();
                    group_table.show();
                }
            }, 
            {
                text: "<i class='glyphicon glyphicon-download-alt'></i>下載zip" ,
                action: function (e, dt, node, config) {
                
                }             
            }]
        })    
    },      

    'loadData': function (data) {
        this.table_element.DataTable().clear();
        this.table_element.DataTable().rows.add(this.companyItems[data]).draw();
    },  

    'show': function(){
       $('#table_company_area').css('display','inline-block');
    },

    'hide': function(){
        $('#table_company_area').css('display','none');
    }
}

var group_table={
    'groupItems':[],

    'init': function (table) {
        var _table = table.DataTable({
            autoWidth: false,
            columns: [
                {data: "group_no"},
                {data: "group_name_list"}
            ],
            order: [[0, 'asc']],
            dom: 'Bfrtlip',
            columnDefs: [{
                'targets': 0,
                'searchable': true,
                'orderable': true,
                'width': '1%',
                'render': function (data, type, full, meta) {
                    return '<td ><button class="btn btn-link" onclick="company_table.loadData(\''+data+'\'); company_table.show(); group_table.hide(); return false">'+data+'</button></td>';
                }
            }],
            buttons:[]
        })    
    },        

    'loadData': function (table, data) {
        table.DataTable().clear();
        table.DataTable().rows.add(data).draw();
    },

    'show': function () {
       $('#table_group_area').css('display','inline-block');
    },

    'hide': function(){
        $('#table_group_area').css('display','none');
    }
}