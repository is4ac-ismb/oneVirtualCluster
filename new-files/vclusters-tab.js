/* -------------------------------------------------------------------------- */
/* Copyright 2002-2013, OpenNebula Project Leads (OpenNebula.org)             */
/*                                                                            */
/* Licensed under the Apache License, Version 2.0 (the "License"); you may    */
/* not use this file except in compliance with the License. You may obtain    */
/* a copy of the License at                                                   */
/*                                                                            */
/* http://www.apache.org/licenses/LICENSE-2.0                                 */
/*                                                                            */
/* Unless required by applicable law or agreed to in writing, software        */
/* distributed under the License is distributed on an "AS IS" BASIS,          */
/* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   */
/* See the License for the specific language governing permissions and        */
/* limitations under the License.                                             */
/* -------------------------------------------------------------------------- */
// Created by:
// Pietro Ruiu - ruiu@ismb.it
// Antonio Attanasio - attanasio@ismb.it
// IS4AC @ ISMB - www.ismb.it

/*Vclusters tab plugin*/
/* VCLUSTER_HISTORY_LENGTH is ignored by server */
var VCLUSTER_HISTORY_LENGTH = 40;

var monitor_global_series = {};



var vcluster_tab_content = '\
<form class="custom" id="form_vclusters" action="">\
<div class="panel">\
<div class="row">\
  <div class="twelve columns">\
    <h4 class="subheader header">\
      <span class="header-resource">\
        <i class="icon-star "></i> '+tr("Virtual Clusters")+'\
      </span>\
      <span class="header-info">\
        <span id="total_vclusters"/> <small>'+tr("TOTAL")+'</small>&emsp;\
      </span>\
      <span class="user-login">\
      </span>\
    </h4>\
  </div>\
</div>\
<div class="row">\
  <div class="ten columns">\
    <div class="action_blocks">\
    </div>\
  </div>\
  <div class="two columns">\
    <input id="vcluster_search" type="text" placeholder="'+tr("Search")+'" />\
  </div>\
  <br>\
  <br>\
</div>\
</div>\
  <div class="row">\
    <div class="twelve columns">\
<table id="datatable_vclusters" class="datatable twelve">\
  <thead>\
    <tr>\
      <th class="check"><input type="checkbox" class="check_all" value=""></input></th>\
      <th>' + tr("ID") + '</th>\
      <th>' + tr("Name") + '</th>\
      <th>' + tr("Virtual Machines") + '</th>\
    </tr>\
  </thead>\
  <tbody id="tbodyvclusters">\
  </tbody>\
</table>\
</form>';

var create_vcluster_tmpl =
	'<div class="panel">\
		<h3 >\
	      <small id="create_vcluster_header">'+tr("Create Virtual Cluster")+'</small>\
	    </h3>\
	  </div>\
	  <form id="create_vcluster_form" action="" class="">\
	  <div class="reveal-body">\
		  <div class="row">\
		      <div class="four columns">\
		          <label class="inline right" for="vcname">' + tr("Cluster Name")  + ':</label>\
		      </div>\
		      <div class="seven columns">\
		          <input type="text" name="name" id="vcname" />\
		      </div>\
		      <div class="one columns">\
		          <div class="tip"></div>\
		      </div>\
		  </div>\
		  <div class="row">\
		  <fieldset>\
		    <legend>'+tr("Master node")+'</legend>\
		    <div class="manager clear row" id="vc_master">\
		    <div class="four columns">\
		        <label class="inline right" for="template_mn">' +  tr("Template") + ':</label>\
		    </div>\
		    <div class="seven columns">\
		          <select id="template_mn" name="templ">\
		          </select>\
		    </div>\
		      <div class="one columns">\
		          <div class="tip"></div>\
		      </div>\
		  	</div>\
		  </fieldset>\
		  <br/>\
		  <fieldset>\
		    <legend>'+tr("Working nodes")+'</legend>\
		    <div class="manager clear row" id="vc_wn">\
		      <div class="four columns">\
		          <label class="inline right" for="template_wn">' +  tr("Template") + ':</label>\
		      </div>\
		      <div class="seven columns">\
		          <select id="template_wn" name="templ">\
		          </select>\
		      </div>\
		      <div class="one columns">\
		          <div class="tip"></div>\
		      </div>\
		    </div>\
		    <div class="manager clear row" id="vc_wnn">\
		      <div class="four columns">\
		          <label class="inline right" for="wnn">' +  tr("Number") + ':</label>\
		      </div>\
		      <div class="seven columns">\
		          <input type="number" name="number" id="wnn" min="1" max="10" />\
		      </div>\
		      <div class="one columns">\
		          <div class="tip"></div>\
		      </div>\
		    </div>\
		  </fieldset>\
		  </div>\
	  </div>\
	    <div class="reveal-footer">\
	      <hr>\
	      <div class="form_buttons row">\
	          <button class="button success right radius" type="submit" id="create_vc_submit" value="OpenNebula.Vcluster.create">' + tr("Create") + '</button>\
	          <button id="wizard_vc_reset_button" class="button secondary radius" type="reset" value="reset">' + tr("Reset") + '</button>\
	          <button class="close-reveal-modal button secondary radius" action="" type="button" value="close">' + tr("Close") + '</button>\
	      </div>\
	    </div>\
	    <a class="close-reveal-modal">&#215;</a>\
	</form>';

var vcluster_select="";
var vms_select="";
var dataTable_vclusters;
var $create_vcluster_dialog;
var vclusterVmJSON;

//Setup actions
var vcluster_actions = {
		
	"Vcluster.create" : {
        type: "create",
        call : OpenNebula.Vcluster.create,
        callback : function(){
            Sunstone.runAction('Vcluster.refresh');
        },
        error : onError,
        notify: true
    },
    
    "Vcluster.create_dialog" : {
        type: "custom",
        call: popUpCreateVclusterDialog
    },
    
    "Vcluster.refresh" : {
        type: "custom",
        call: function(){
            waitingNodes(dataTable_vclusters);
            Sunstone.runAction("Vcluster.list");
        },
        error: onError
    },
    
    "Vcluster.autorefresh" : {
        type: "custom",
        call : function() {
            OpenNebula.Vcluster.list({timeout: true, success: updateVclustersView, error: onError});
        }
    },
    
    "Vcluster.list" : {
        type: "list",
        call: OpenNebula.Vcluster.list,
        callback: updateVclustersView,
        error: onError
    },
   
    "Vcluster.showinfo" : {
        type: "single",
        call: OpenNebula.Vcluster.show,
        callback: updateVclusterInfo,
        error: onError
    },
    
//    "Vcluster.addvm" : {
//        type: "multiple",
//        call: function(params){
//            var vm = params.data.extra_param;
//            var vcluster = params.data.id;
//
//            if (vclusterVmJSON[vm] != null){
//            	alert('VM ' + vm + ' is already assigned to virtual cluster ' + vclusterVmJSON[vm]);
//            	return;
//            	//TODO: manage this error...
//            	
//            }
//         
//            OpenNebula.Vcluster.addvm({
//                    data:{
//                        id:vcluster,
//                        extra_param:vm
//                    }
//                });
//        },
//        callback: function () {
//            Sunstone.runAction("Vcluster.refresh");
//        },
//        error: onError,
//        elements: vclusterElements,
//        notify:true
//    }, 
    
    "Vcluster.delete" : {
        type: "multiple",
        call : OpenNebula.Vcluster.del,
        callback : deleteVclusterElement,
        elements: vclusterElements,
        error : onError,
        notify:true
    }, 
//  
//    //TODO: implement this action
//    "Vcluster.remove_vm" : {
//        type: "multiple",
//        call : OpenNebula.Vcluster.del,
//        callback : deleteVclusterElement,
//        elements: vclusterElements,
//        error : onError,
//        notify:true
//    }, 
//    
    "Vcluster.monitor_vm" : {
        type: "monitor",
        call : OpenNebula.VM.monitor,
        callback: function(req,response) {
        	var vcluster_graphs = [
                   {
                       monitor_resources : "CPU",
                       labels : "Aggregate CPU",
                       humanize_figures : false,
                       div_graph : $("#vcluster_cpu_graph")
                   },
                   {
                       monitor_resources : "MEMORY",
                       labels : "Aggregate MEM",
                       humanize_figures : true,
                       div_graph : $("#vcluster_mem_graph")
                   },
                   { labels : "Aggr. Network reception",
                     monitor_resources : "NET_RX",
                     humanize_figures : true,
                     convert_from_bytes : true,
                     div_graph : $("#vcluster_netrx_graph")
                   },
                   { labels : "Aggr. Network transmission",
                     monitor_resources : "NET_TX",
                     humanize_figures : true,
                     convert_from_bytes : true,
                     div_graph : $("#vcluster_nettx_graph")
                       }
                   ];
            var info = req.request.data[0].monitor;
            var vm_id = req.request.data[0].id;
//            aggregateResults(response, info, vm_id);
            
//            for(var i=0; i<vcluster_graphs.length; i++) {
////            	if(info.monitor_resources == vcluster_graphs[i].monitor_resources)
//		            aggregateResults(
//		                    response,
//		                    vcluster_graphs[i],
//		                    vm_id
//		                );
////                plot_graph(
////                        response,
////                        vcluster_graphs[i]
////                    );
//            }
            preAggregateResults(
                    response,
                    vcluster_graphs,
                    vm_id,
                    info.monitor_resources
                );
        },
        error: vmMonitorError
    }

};

var vcluster_buttons = {
		
    "Vcluster.refresh" : {
        type: "action",
        layout: "refresh",
        alwaysActive: true
    },
    "Vcluster.create_dialog" : {
        type: "create_dialog",
        layout: "create",
        condition: mustBeAdmin
    },
    
//    "Vcluster.addvm" : {
//	      type: "confirm_with_select",
//	      text: tr("Add Virtual Machine"),
//	      select: vms_sel,
//	      tip: tr("Select the VM to be included in the cluster")+":",
//	      condition: mustBeAdmin, 
//	},
    
    "Vcluster.delete" : {
        type: "confirm",
        text: tr("Delete"),
        layout: "del"
    }
    
};

var vcluster_info_panel = {
		
    "vcluster_info_tab" : {
        title: tr("Virtual cluster information"),
        content:""
    },

    "vcluster_monitoring_tab" : {
        title: tr("Graphs"),
        content: ""
    },
    
    "vcluster_vms_tab" : {
        title: tr("Virtual Machines"),
        content: vms_tab_content
    }

};

var vcluster_tab = {
    title: tr("Virtual Clusters"),
    content: vcluster_tab_content,
    buttons: vcluster_buttons,
    showOnTopMenu: false,
    tabClass: "subTab",
    parentTab: "vresources-tab"
};

Sunstone.addActions(vcluster_actions);

Sunstone.addMainTab('vclusters-tab',vcluster_tab);

Sunstone.addInfoPanel("vcluster_info_panel",vcluster_info_panel);

function vclusterElements(){
    return getSelectedNodes(dataTable_vclusters);
}

//TODO: update also after vcluster deletion
function updateVclusterVmJSON(list){
	
	vclusterVmJSON = {};
    $.each(list,function(){
    	var json_element = this.VCLUSTER;
    	var vcluster_id = json_element.ID;
    	var json_vms = json_element.VMS.ID;
    	for( var i=0; i<json_vms.length; i++){
    		var vm_id = json_vms[i];
    		vclusterVmJSON[vm_id] = vcluster_id;
    	}   	
    });
}

function vmsOfVcluster(vcluster_id){

	if(vcluster_id == "-")
		return unclusteredVms();
	
	var sel_vms = []; 
	
	for(var i in vclusterVmJSON){
		if(vclusterVmJSON[i] == vcluster_id)
			sel_vms.push(i);
    }
	
	return sel_vms;
}

function unclusteredVms(){
	
	var uncl_vms = [];
	var rows = dataTable_vMachines.fnGetData();

    $.each(rows,function(){	
	    var found = false;	
		for(var i in vclusterVmJSON){
			if (i == this[1]){
				found = true;
				break;
			}
		}
		if(!found)
			uncl_vms.push(this[1]);
    });
	return uncl_vms;
}

function previousVm(vm_id){
	
	var vms = vmsOfVcluster(vclusterVmJSON[vm_id]);
	var r = -1;
	var mindiff = -1;
	for(var i=0;i<vms.length;i++){
		
		if( vms[i]<vm_id && (mindiff == -1 || vm_id-vms[i] < mindiff) ){
			mindiff = vm_id-vms[i];
			r = vms[i];
		}
	}
	return r;
}

function nextVm(vm_id){
	
	var vms = vmsOfVcluster(vclusterVmJSON[vm_id]);
	var r = -1;
	var mindiff = -1;
	for(var i=0;i<vms.length;i++){
		
		if( vms[i]>vm_id && (mindiff == -1 || vms[i]-vm_id < mindiff) ){
			mindiff = vms[i]-vm_id;
			r = vms[i];
		}
	}
	return r;
}

function vclusterElementArray(element_json){

    var element = element_json.VCLUSTER;

    var vms = 0;
    if ($.isArray(element.VMS.ID))
    	vms = element.VMS.ID.length;
    else if (!$.isEmptyObject(element.VMS.ID))
    	vms = 1;

    return [
        '<input class="check_item" type="checkbox" id="vcluster_'+element.ID+'" name="selected_items" value="'+element.ID+'"/>',
        element.ID,
        element.NAME,
        vms
    ];
}

//callback to update the list of virtual clusters.
function updateVclustersView (request,list){
	
	var list_array = [];
	
    // TODO: ms to s, sunstone-util probably does s to ms
    var now = new Date().getTime() / 1000;
    var do_vcluster_monitoring_graphs = true;

    if (typeof (last_vcluster_monitoring_time) == 'undefined'){
    	last_vcluster_monitoring_time = 0;
    }

    // If the refresh is too frequent, ignore it. In seconds
    if (now < last_vcluster_monitoring_time + 60){
    	do_vcluster_monitoring_graphs = false;
    }

//    if (!do_vcluster_monitoring_graphs){

        $.each(list,function(){
            //Grab table data from the list
        	list_array.push(vclusterElementArray(this));
        });

//    }
	
    updateView(list_array,dataTable_vclusters);
    updateVclusterSelect();
    updateVmsSelect();
    //update the associations between virtual clusters and virtual machines
    updateVclusterVmJSON(list);
    
    $("#total_vclusters", form_vclusters).text(list.length);
};

//callback for actions deleting a cluster element
function deleteVclusterElement(request){
    
    deleteElement(dataTable_vclusters,'#vcluster_'+request.request.data);
    
    var vms = vmsOfVcluster(request.request.data);
    
    Sunstone.runAction("VM.delete",vms);
    
	for(var i in vclusterVmJSON){
		if(vclusterVmJSON[i] == request.request.data)
			delete vclusterVmJSON[i];
    }    
    updateVclusterSelect();
    
    
}

//Updates the host info panel tab content and pops it up
function updateVclusterInfo(request,vcluster){
	monitor_global_series = {};
    var vcluster_info = vcluster.VCLUSTER;
    //Information tab
    var vms_content = '';
    for (var i=0; i<vcluster_info.VMS.ID.length;i++){
    	vm_name = getValue(vcluster_info.VMS.ID[i], 1, 4, dataTable_vMachines);
    	vms_content += '<tr>\
    						<td class="value_td">'+vcluster_info.VMS.ID[i]+'</td>\
							<td class="value_td">'+vm_name+'</td>\
    					</tr>';
    };
    var info_tab = {
        title : tr("Virtual Cluster information"),
        content :
        '<div class="">\
        <div class="six columns">\
        <table id="info_vcluster_table" class="twelve datatable extended_table">\
            <thead>\
               <tr><th colspan="2">' + tr("Virtual cluster information") + '</th></tr>\
            </thead>\
            <tbody>\
            <tr>\
                <td class="key_td">' + tr("id") + '</td>\
                <td class="value_td">'+vcluster_info.ID+'</td>\
            </tr>\
            <tr>\
                <td class="key_td">' + tr("Name") + '</td>\
                <td class="value_td">'+vcluster_info.NAME+'</td>\
            </tr>\
            </tbody>\
	     </table>\
	     </div>\
	     <div class="six columns">\
		 <table id="vms_vcluster_table" class="info_table twelve datatable extended_table">\
	        <thead>\
	           <tr><th colspan="4">' + tr("Included virtual machines") + '</th></tr>\
	        </thead>\
	        <tr>\
          		<td class="key_td"><i>' + tr("id") + '</i></td>\
          		<td class="key_td"><i>' + tr("Name") + '</i></td>\
          	</tr>\
	        <tbody>' 
	        + vms_content +
	        '</tbody>\
		 </table>'
    };
    
    var monitor_tab = {
            title: tr("Graphs"),
            content:
            '<div class="">\
                <div class="six columns">\
                  <div class="row graph_legend">\
                    <h3 class="subheader"><small>'+tr("CPU")+'</small></h3>\
                  </div>\
                  <div class="row">\
                    <div class="ten columns centered graph" id="vcluster_cpu_graph" style="height: 100px;">\
                    </div>\
                  </div>\
                  <div class="row graph_legend">\
                    <div class="ten columns centered" id="vcluster_cpu_legend">\
                    </div>\
                  </div>\
                </div>\
                <div class="six columns">\
                  <div class="row graph_legend">\
                    <h3 class="subheader"><small>'+tr("MEMORY")+'</small></h3>\
                  </div>\
                  <div class="row">\
                    <div class="ten columns centered graph" id="vcluster_mem_graph" style="height: 100px;">\
                    </div>\
                  </div>\
                  <div class="row graph_legend">\
                    <div class="ten columns centered" id="vcluster_mem_legend">\
                    </div>\
                  </div>\
                </div>\
                <div class="six columns">\
	                <div class="row graph_legend">\
	                  <h3 class="subheader"><small>'+tr("NET TRANSMISSION")+'</small></h3>\
	                </div>\
	                <div class="row">\
	                  <div class="ten columns centered graph" id="vcluster_nettx_graph" style="height: 100px;">\
	                  </div>\
	                </div>\
	                <div class="row graph_legend">\
	                  <div class="ten columns centered" id="vcluster_nettx_legend">\
	                  </div>\
	                </div>\
	              </div>\
	            </div>\
                <div class="six columns">\
	                <div class="row graph_legend">\
	                  <h3 class="subheader"><small>'+tr("NET RECEPTION")+'</small></h3>\
	                </div>\
	                <div class="row">\
	                  <div class="ten columns centered graph" id="vcluster_netrx_graph" style="height: 100px;">\
	                  </div>\
	                </div>\
	                <div class="row graph_legend">\
	                  <div class="ten columns centered" id="vcluster_netrx_legend">\
	                  </div>\
	                </div>\
	              </div>\
	            </div>'
        };

    var vms_tab = {
            title: tr("Virtual Machines"),
            content : printVclusterVms(vcluster_info.ID)
    };
    
    Sunstone.updateInfoPanelTab("vcluster_info_panel","vcluster_info_tab",info_tab);
    Sunstone.updateInfoPanelTab("vcluster_info_panel","vcluster_monitoring_tab",monitor_tab);
    Sunstone.updateInfoPanelTab("vcluster_info_panel","vcluster_vms_tab",vms_tab);

    var clustered_vms = vmsOfVcluster(vcluster_info.ID);
    for (var j=0;j<clustered_vms.length;j++){	
    	if(clustered_vms[j] == Math.max.apply(null, clustered_vms)){
	    		Sunstone.runAction("Vcluster.monitor_vm",clustered_vms[j],
					{ monitor_resources : "CPU,MEMORY,NET_TX,NET_RX"});
    	}
   	}
    
    Sunstone.popUpInfoPanel("vcluster_info_panel", "vclusters-tab");
    
    $("#vcluster_info_panel_refresh", $("#vcluster_info_panel")).click(function(){
        $(this).html(spinner);
        Sunstone.runAction('Vcluster.showinfo', vcluster_info.ID);
      });
    
//    alert($("tbody", dataTable_vMachines).html());
    
};

function preAggregateResults(response,graphs,vm_id,graph_id){
	
	for(var i=0; i<graphs.length; i++) {
		
		if(nextVm(vm_id) == -1){ //this is the first considered vm
			aggregateResults(response, graphs[i], vm_id);	  		
		}
		
		else{
			if(graphs[i].monitor_resources == graph_id)
				aggregateResults(response, graphs[i], vm_id);
		}
  	}
}

function aggregateResults(response,info,vm_id){
	
    series = [];
    var graph_name = info.monitor_resources;

    var prev_vm = previousVm(vm_id);
    
    var attributes = info.monitor_resources.split(',');

//    alert("ok1    " + vm_id + " " + prev_vm + " " + attributes.length);

    if (info.labels) {
        labels = info.labels.split(',');
    }

    for (var i=0; i<attributes.length; i++)
    {
        var attribute = attributes[i];
        var data = response.monitoring[attribute];

//        if(info.derivative == true) {
//            derivative(data);
//        }

        series.push({
            stack: attribute,
            // Turns label TEMPLATE/BLABLA into BLABLA
            label: labels ? labels[i] : attribute[i].split('/').pop(),
            data: data
        });

    }
    
    addToGlobalSeries(series, vm_id, graph_name);

    if(prev_vm != -1){ //call prev vm
	Sunstone.runAction("Vcluster.monitor_vm",prev_vm,
		{monitor_resources : graph_name});
//	alert("new action " + prev_vm + graph_name);

    }
    else{ //prepare plot
//    	alert("plot " + vm_id + graph_name);
    	//Set options for the plots:
        var humanize = info.humanize_figures ?
                humanize_size : function(val){ return val; };
        
            var options = {
//                colors: [ "#cdebf5", "#2ba6cb", "#6f6f6f" ]
                colors: [ "#2ba6cb", "#707D85", "#AC5A62" ],
                legend : { show : (info.div_legend != undefined),
                           noColumns: attributes.length,
                           container: info.div_legend
                         },
                xaxis : {
                    tickFormatter: function(val,axis){
                        return pretty_time_axis(val, info.show_date);
                    }
                },
                yaxis : { labelWidth: 50,
                          tickFormatter: function(val, axis) {
                              return humanize(val, info.convert_from_bytes, info.y_sufix);
                          },
                          min: 0
                        }
            };
//        alert("PLOT3 " + info.div_graph + monitor_global_series[graph_name][0].data[0][1]);
	    $.plot(info.div_graph,monitor_global_series[graph_name],options); //call to flot lib
//	    alert("ok else");
    }
    	
};

function addToGlobalSeries(series, vm_id, graph_id){
	
	if( nextVm(vm_id) > 0 && monitor_global_series[graph_id]){
		res = monitor_global_series[graph_id];
//		alert('aggiunte...' + graph_id + " vm id " + vm_id + " res length " + res.length);
		for(var k=0;k<res.length;k++){
			res_data = res[k].data;
//			alert("precedente " + res_data[0][1] + " addendo2 " + series[k].data[0][1],10);
			for(var i=0;i<res_data.length;i++){
				monitor_global_series[graph_id][k].data[i][1] = 
						(
						parseInt(res_data[i][1], 10) + 
						parseInt(series[k].data[i][1],10)
						).toString();		
			}
		}
	} 
	else{
//		alert('create...' + graph_id + vm_id);
		monitor_global_series[graph_id] = series;
	}

};

function printVclusterVms(vcluster_id){
	
	var dataTable_vcluster_vms =  dataTable_vMachines;
	
	var selected_vms = vmsOfVcluster(vcluster_id);
	var selected_vms_regex = "";
	for(var i=0;i<selected_vms.length;i++){
		selected_vms_regex += selected_vms[i];
		if(i<selected_vms.length-1)
			selected_vms_regex += "|"; 
	}
	dataTable_vcluster_vms.fnFilter(selected_vms_regex,1,true,true,false,true);
	
	$("td.sorting_1", dataTable_vcluster_vms).remove();
	//TODO: show columns according to table_columns vector,
	//which declares the visible columns
	var html_content = '\
	<form class="custom" id="vcluster_vms_list" action="">\
	  <div class="row">\
	    <div class="twelve columns">\
	<table id="datatable_vcluster_vms" class="info_table twelve extended_table">\
	  <thead>\
	    <tr>\
	      <th>'+tr("ID")+'</th>\
	      <th>'+tr("Owner")+'</th>\
	      <th>'+tr("Group")+'</th>\
	      <th>'+tr("Name")+'</th>\
	      <th>'+tr("Status")+'</th>\
	      <th>'+tr("Host")+'</th>\
	      <th>'+tr("IPs")+'</th>\
	      <th>'+tr("VNC")+'</th>\
	    </tr>\
	  </thead>\
	  <tbody id="tbodyvclustervms">' 
	      + $("#tbodyvmachines", dataTable_vcluster_vms).html()
	      + 	'</tbody>\
	      	</table>\
	      	</form>';
	
//	alert(html_content);
	
	//
	dataTable_vcluster_vms.fnFilter('',1,true,true,false,true);
	
	return html_content;

}


//Taken from getValue function in sunstone-util plugin
//Search a datatable record CONTAINING the filter_str in the filter_col. Returns
//the value of that record in the desired value column.
function getValue_startsWith(filter_str,filter_col,value_col,dataTable){
	 var values = [];
	 if (typeof(dataTable) == "undefined") return values;
	 var nodes = dataTable.fnGetData();

	 $.each(nodes,function(){

		 var string = this[filter_col];
	     if (string.match("^"+filter_str) ){
	         values.push(this[value_col]);

	     }
	 });
	 return values;
};

//Updates the select input field with an option for each template
function updateTemplateSelect1(){
    var templates_select =
        makeSelectOptions(dataTable_templates,
                          1,//id_col
                          4,//name_col
                          [],//status_cols
                          []//bad status values
                         );

    //update static selectors:
    $('#template_mn', $create_vcluster_dialog).html(templates_select);
    $('#template_wn', $create_vcluster_dialog).html(templates_select);
}

//updates the cluster select by refreshing the options in it
function updateVclusterSelect(){
    vcluster_select = '<option value="-1">Default (none)</option>';
    vcluster_select += makeSelectOptions(dataTable_vclusters,
                                         1,//id_col
                                         2,//name_col
                                         [],//status_cols
                                         [],//bad_st
                                         true
                                        );
}

function updateVmsSelect(){
//    vms_select = '<option value="-1">Default (none)</option>';
    vms_select = makeSelectOptions(dataTable_vMachines,
                                         1,//id_col
                                         4,//name_col
                                         [],//status_cols
                                         [],//bad_st
                                         true
                                        );
}

//Prepares the vcluster creation dialog
function setupCreateVclusterDialog(){
    dialogs_context.append('<div title=\"'+tr("Create Virtual Cluster")+'\" id="create_vcluster_dialog"></div>');
    $create_vcluster_dialog = $('div#create_vcluster_dialog');
    var dialog = $create_vcluster_dialog;

    dialog.html(create_vcluster_tmpl);
    dialog.addClass("reveal-modal max-height");

    //Handle the form submission
    $('#create_vcluster_form',dialog).submit(function(){
        var vcname = $('#vcname',this).val();
        var template_mn = $('select#template_mn',this).val();
        var template_wn = $('select#template_wn',this).val();
        var wnn = $('#wnn',this).val();
        var n_times_int = 1;
        if (!vcname){
            notifyError(tr("Virtual Cluster name missing!"));
            return false;
        }
        if (!template_mn){
            notifyError(tr("You have not selected a template for master node"));
            return false;
        };
        if (!template_wn){
            notifyError(tr("You have not selected a template for working nodes"));
            return false;
        };
        if (wnn && parseInt(wnn,10)){
            n_times_int = parseInt(wnn,10);
        }
        else{
            notifyError(tr("Please, insert a valid number of working nodes"));
            return false;
        };
        var vcluster_json = { "vcluster": 
				{ "name": vcname
                }
            };
        var master_name = vcname.concat("-master");
//        alert(vcname + " " + template_mn + " " + template_wn + " " + n_times_int);
        // instantiate master
        Sunstone.runAction("Template.instantiate",[template_mn],master_name);    
        // instantiate nodes
        var name = "";
        for (var i=0; i< n_times_int; i++){
            name = vcname.concat("-wn-").concat(i);
            Sunstone.runAction("Template.instantiate",[template_wn],name);            
        };
        
        //Create the OpenNebula.Vcluster.
        //If it is successfull we refresh the list.
        Sunstone.runAction("Vcluster.create",vcluster_json);
        $create_vcluster_dialog.trigger("reveal:close");

        Sunstone.runAction("VM.list");
	        
        setTimeout(function(){
	                	           
	        //Now, search for new vms in the datatable and associate them to the vcluster
	        var vms_ids = getValue_startsWith(vcname, 4, 1, dataTable_vMachines);
	        var vcluster_id = getValue(vcname, 2, 1, dataTable_vclusters);

	        for (var i=0; i< vms_ids.length; i++){
	        	var vm_id = vms_ids[i];
	            OpenNebula.Vcluster.addvm({
	                data:{
	                    id:vcluster_id,
	                    extra_param: vm_id
	                }
	            });
	        }
        
        },300*(n_times_int+1));
       
        setTimeout(function(){
        		Sunstone.runAction('Vcluster.refresh');
        	},700*(n_times_int+1)); 

        return false;
        
        
    });

    $('#wizard_vc_reset_button').click(function(){
    	$create_vcluster_dialog.trigger('reveal:close');
    	$create_vcluster_dialog.remove();
    	setupCreateVclusterDialog();

    	popUpCreateVclusterDialog();
    });
    
    
}

//Prepares the autorefresh for vms
function setVclusterAutorefresh(){
    setInterval(function(){
        var checked = $('input.check_item:checked',dataTable_vclusters);
        var  filter = $("#vcluster_search").attr('value');
        if ((checked.length==0) && !filter){
            Sunstone.runAction("Vcluster.autorefresh");
        }
    },INTERVAL+someTime());
}

// Open creation dialog
function popUpCreateVclusterDialog(){
	updateTemplateSelect1();
    $create_vcluster_dialog.reveal();
    return false;
}

function vcluster_sel() {
    return vcluster_select;
}

function vms_sel() {
    return vms_select;
}

function vms_sel(vcluster_id, exclude) {
	
	sel = vms_sel();
	for(var i=0;i<sel.length;i++)
//		alert('ciao' + sel[i]);
	if(vclusterVmJSON[vm])
	
    return vms_select;
}

//This is executed after the sunstone.js ready() is run.
//Here we can basicly init the host datatable, preload it
//and add specific listeners
$(document).ready(function(){
    var tab_name = "vclusters-tab";
    dataTable_vclusters = $("#datatable_vclusters",main_tabs_context).dataTable({
        "aoColumnDefs": [
            { "bSortable": false, "aTargets": ["check"] },
            { "sWidth": "35px", "aTargets": [0] },
            { "bVisible": true, "aTargets": Config.tabTableColumns(tab_name)},
            { "bVisible": false, "aTargets": ['_all']}
        ]
    });
    
    $('#vcluster_search').keyup(function(){
        dataTable_vclusters.fnFilter( $(this).val() );
      });
    
      dataTable_vclusters.on('draw', function(){
        recountCheckboxes(dataTable_vclusters);
      });
      
    Sunstone.runAction("Vcluster.list");

    setupCreateVclusterDialog();

    setVclusterAutorefresh();
    
    initCheckAllBoxes(dataTable_vclusters);
    tableCheckboxesListener(dataTable_vclusters);
    infoListener(dataTable_vclusters, "Vcluster.showinfo");

});
