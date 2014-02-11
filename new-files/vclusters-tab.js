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
var VC_INFO = {};

var master_suffix = "-master";
var worker_suffix = "-wn-";
var MASTER_ROLE = "Master";
var WORKER_ROLE = "Worker";

//boolean variables
var error_intnetwork_params;
var error_extnetwork_params;

var monitor_global_series = {};

var OneVirtualCluster = {

    "Vcluster" : {
        "resource" : "VCLUSTER",

        "create" : function(params){
            OpenNebula.Action.create(params,OneVirtualCluster.Vcluster.resource);
        },
        "del" : function(params){
            OpenNebula.Action.del(params,OneVirtualCluster.Vcluster.resource);
        },
        "list" : function(params){
            OpenNebula.Action.list(params,OneVirtualCluster.Vcluster.resource);
        },
        "show": function(params){
            OpenNebula.Action.show(params,OneVirtualCluster.Vcluster.resource);
        },
        "addvm" : function(params){
            var action_obj = { "vm_id": params.data.extra_param };
            OpenNebula.Action.simple_action(params,OneVirtualCluster.Vcluster.resource,
                                            "addvm",action_obj);
        },
        "delvm" : function(params){
            var action_obj = { "vm_id": params.data.extra_param };
            OpenNebula.Action.simple_action(params,OneVirtualCluster.Vcluster.resource,
                                            "delvm",action_obj);
        }
//        "update" : function(params){
//            var action_obj = {"template_raw" : params.data.extra_param };
//            OpenNebula.Action.simple_action(params,
//                                            OneVirtualCluster.Vcluster.resource,
//                                            "update",
//                                            action_obj);
//        }
    }

};

var vcluster_tab_content = '\
<form class="custom" id="form_vclusters" action="">\
<div class="panel">\
<div class="row">\
  <div class="twelve columns">\
    <h4 class="subheader header">\
      <span class="header-resource">\
        <i class="icon-link "></i> '+tr("Virtual Clusters (by IS4AC)")+'\
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
      <th>' + tr("Internal Network") + '</th>\
      <th>' + tr("External Network") + '</th>\
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
   <form id="create_vcluster_form" action="">\
     \
     <div class="reveal-body">\
	<div class="row">\
	    <div class="seven columns">\
		<div class="four columns">\
		  <label class="inline right" for="vcname">' + tr("Cluster Name")  + ':</label>\
		</div>\
		<div class="seven columns">\
		  <input type="text" name="name" id="vcname" />\
		</div>\
		<div class="one columns">\
		  <div class="tip">'+tr("Type a name for the new virtual cluster. Be sure that no existing cluster is already using this name.")+'</div>\
		</div>\
	    </div>\
	</div>\
	\
	\
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
	          <div class="tip">'+tr("Select the template for the master node of the cluster.")+'</div>\
	      </div>\
	    </div>\
	    <div class="manager clear row" id="vc_enet">\
	      <div class="four columns">\
	          <label class="inline right" for="virt_net_ext_id">' +  tr("External network") + ':</label>\
	      </div>\
	      <div class="seven columns">\
	          <select id="virt_net_ext_id" name="enet">\
	          </select>\
	          </div>\
	      <div class="one columns">\
	          <div class="tip">'+tr("Select the virtual network to assign the external inerface of the master node.")+'</div>\
	      </div>\
	    </div>\
	  </fieldset>\
	  <br/>\
	  <fieldset>\
	    <legend>'+tr("Worker nodes")+'</legend>\
	    <div class="manager clear row" id="vc_wn">\
	      <div class="four columns">\
	          <label class="inline right" for="template_wn">' +  tr("Template") + ':</label>\
	      </div>\
	      <div class="seven columns">\
	          <select id="template_wn" name="templ">\
	          </select>\
	      </div>\
	      <div class="one columns">\
	          <div class="tip">'+tr("Select the template for the worker nodes of the cluster.")+'</div>\
	      </div>\
	    </div>\
	    <div class="manager clear row" id="vc_wnn">\
	      <div class="four columns">\
	          <label class="inline right" for="wnn">' +  tr("Nodes number") + ':</label>\
	      </div>\
	      <div class="seven columns">\
	          <!-- <input type="text" name="number" id="wnn" />-->\
	           <input type="number" name="number" id="wnn" min="1" max="99" />  \
	          </div>\
	      <div class="one columns">\
	          <div class="tip">'+tr("Type the number of worker nodes to deploy.")+'</div>\
	      </div>\
	    </div>\
	  </fieldset>\
	  <br/>\
	  <fieldset>\
	    <legend>'+tr("Dedicated network")+'</legend>\
	    <div class="manager clear row" id="vc_inet">\
	      <div class="four columns">\
	          <label class="inline right" for="virt_net_int_id">' +  tr("Network") + ':</label>\
	      </div>\
	      <div class="seven columns">\
	          <select id="virt_net_int_id" name="inet">\
	          </select>\
	      </div>\
	      <div class="one columns">\
	          <div class="tip">'+tr("Select the /16 virtual network from where to pick a /24 subnet for intra-cluster communications.")+'</div>\
	      </div>\
	    </div>\
	    <div class="manager clear row" id="vc_sub_addr">\
	      <div class="four columns">\
	          <label class="inline right" for="sub_addr">' +  tr("Subnet address") + ':</label>\
	      </div>\
	      <div class="seven columns">\
	          <input type="text" name="number" id="sub_addr" disabled/>\
	          <!-- <input type="number" name="number" id="sub_addr" min="1" max="254" /> --> \
	          </div>\
	      <div class="one columns">\
	          <!-- <div class="tip">'+tr("Choose a number between 1 and 254 to complete the prefix of the /24 subnet assigned to the new cluster.")+'</div>\ -->\
		  <div class="tip">'+tr("Subnets are automatically assigned.")+'</div>\
	      </div>\
	    </div>\
	  </fieldset>\
  	</div>\
    </div>\
    \
    \
    <div class="reveal-footer">\
      <hr>\
      <div class="form_buttons row">\
          <button class="button success right radius" type="submit" id="create_vc_submit" value="OneVirtualCluster.Vcluster.create">' + tr("Create") + '</button>\
          <button id="wizard_vc_reset_button" class="button secondary radius" type="reset" value="reset">' + tr("Reset") + '</button>\
          <button class="close-reveal-modal button secondary radius" action="" type="button" value="close">' + tr("Close") + '</button>\
      </div>\
    </div>\
    \
  </form>\
    <a class="close-reveal-modal">&#215;</a>\
';

var vcluster_select="";
var vms_select="";
var dataTable_vclusters;
var $create_vcluster_dialog;
var vclusterVmJSON;

var total_vclusters = 0;

//Setup actions
var vcluster_actions = {
		
    "Vcluster.create" : {
        type: "create",
        call : OneVirtualCluster.Vcluster.create,
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
            OneVirtualCluster.Vcluster.list({timeout: true, success: updateVclustersView, error: onError});
        }
    },
    
    "Vcluster.list" : {
        type: "list",
        call: OneVirtualCluster.Vcluster.list,
        callback: updateVclustersView,
        error: onError
    },
   
    "Vcluster.showinfo" : {
        type: "single",
        call: OneVirtualCluster.Vcluster.show,
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
//            	return;
//            	//TODO: manage this error...
//            	
//            }
//         
//            OneVirtualCluster.Vcluster.addvm({
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
        call : OneVirtualCluster.Vcluster.del,
        callback : deleteVclusterElement,
        elements: vclusterElements,
        error : onError,
        notify:true
    }, 
//  
//    //TODO: implement this action
//    "Vcluster.remove_vm" : {
//        type: "multiple",
//        call : OneVirtualCluster.Vcluster.del,
//        callback : 
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
                    info.monitor_resources);
        },
        error: vmMonitorError
    },
    
    "Vcluster.template-info" : {
        type: "single",
        call: OpenNebula.Template.show,
        callback: editTemplateJSON,
        error: onError
    },

//same as "Template.clone", but without notification
    "Vcluster.template-clone" : {
        type: "single",
        call: OpenNebula.Template.clone,
        error: onError,
        notify: false
    },

//same as "Template.update", but without notification
    "Vcluster.template-update" : {
        type: "single",
        call: OpenNebula.Template.update,
        callback: instantiateVm,
        error: onError,
	notify: false
    },

//same as "Template.delete", but without notification
    "Vcluster.template-delete" : {
        type: "multiple",
        call: OpenNebula.Template.del,
        callback: deleteTemplateElement,
        elements: templateElements,
        error: onError,
        notify: false
    },

    "Vcluster.template-list" : {
        type: "list",
        call: OpenNebula.Template.list,
        callback: gatherTemplatesIds,
        error: onError,
	notify: false
    },

    "Vcluster.network-show" : {
        type: "single",
        call: OpenNebula.Network.show,
        callback: getNetworkParams,
        error: onError
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

	$.each(list,function(){
	    	//Grab table data from the list
		var vc_json = JSON.parse(this.VCLUSTER.TEMPLATE.BODY);
		vc_json.vcluster.id = this.VCLUSTER.ID;
	});
	
	vclusterVmJSON = {};
    $.each(list,function(){
    	var vcluster_id = this.VCLUSTER.ID;
    	var json_element = JSON.parse(this.VCLUSTER.TEMPLATE.BODY);

    	var arr_vms = parseVmsOfVcluster(json_element); 
    	for( var i=0; i<arr_vms.length; i++){
    		vclusterVmJSON[arr_vms[i]] = vcluster_id;
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

function parseVmsOfVcluster(vc_body){

	var vms_arr = vc_body.vcluster.vms.workers;
	vms_arr.unshift(vc_body.vcluster.vms.master);
	return vms_arr;
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

	var element = element_json.vcluster;

	var vms = 0;
	if ( $.isArray(element.vms.workers) )
		vms = element.vms.workers.length;
	else if ( !$.isEmptyObject(element.vms.workers) )
		vms = 1;
	if( element.vms.master != undefined )
		vms++;

	return [
		'<input class="check_item" type="checkbox" id="vcluster_'+element.id+'" name="selected_items" value="'+element.id+'"/>',
		element.id,
		element.name,
		vms,
		element.networks.internal.netaddr24,
		element.networks.extern.netaddr
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

	$.each(list,function(){
	    	//Grab table data from the list

		var vc_json = JSON.parse(this.VCLUSTER.TEMPLATE.BODY);
		vc_json.vcluster.id = this.VCLUSTER.ID;
		list_array.push( vclusterElementArray(vc_json) );
	});

	updateView(list_array,dataTable_vclusters);
	updateVclusterSelect();
	updateVmsSelect();
	//update the associations between virtual clusters and virtual machines
	updateVclusterVmJSON(list);

	total_vclusters = list.length;
	$("#total_vclusters", form_vclusters).text(total_vclusters);
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
    $("#total_vclusters", form_vclusters).text(--total_vclusters);
}

function getNetworkInfo(){

	Sunstone.runAction("Vcluster.network-show", VC_INFO.network_intID);
	Sunstone.runAction("Vcluster.network-show", VC_INFO.network_extID);

	return (!error_intnetwork_params && !error_extnetwork_params);
}

//WARNING: actually, only /8, /16 and /24 prefixes are detected
function getNetworkParams(request, vn_json){

	var vnet = vn_json.VNET;
	var tmpl = vnet.TEMPLATE;

	var thisnetparams_error = false;

	var error_elements = [];

	if(!tmpl.VC_NETWORK_ADDRESS) 
		error_elements.push("\n->VC_NETWORK_ADDRESS");
	if(!tmpl.VC_NETWORK_MASK) 
		error_elements.push("\n->VC_NETWORK_MASK");
	if(!tmpl.VC_DNS)
		error_elements.push("\n->VC_DNS");
	if(!tmpl.VC_GATEWAY && vnet.ID == VC_INFO.network_extID ) //only for external network
		error_elements.push("\n->VC_GATEWAY");
	
	if(error_elements.length > 0){

		thisnetparams_error = true; //found errors
		var error_string = "The following parameters are missing in the selected Virtual Networks templates:\n(Vnet:" + vnet.NAME + ")";
		for(i=0;i<error_elements.length;i++)
			error_string += error_elements[i];

		notifyError(error_string);
	}
	
	if( vnet.ID == VC_INFO.network_intID)
		error_intnetwork_params = thisnetparams_error;
	if(vnet.ID == VC_INFO.network_extID)
		error_extnetwork_params = thisnetparams_error;

	if(!thisnetparams_error){//network parameters extraction was successful

		//internal network
		if( vnet.ID == VC_INFO.network_intID){
		
			VC_INFO.network_intsub16address = tmpl.VC_NETWORK_ADDRESS;
			VC_INFO.network_intsub16mask = tmpl.VC_NETWORK_MASK;
			VC_INFO.network_intsub16prefix = parsePrefix( VC_INFO.network_intsub16address, 
									VC_INFO.network_intsub16mask );
			VC_INFO.network_intsub16dns = tmpl.VC_DNS;
			VC_INFO.network_intsub16gw = tmpl.VC_GATEWAY ? tmpl.VC_GATEWAY : "";	
		}

		//external network
		if(vnet.ID == VC_INFO.network_extID){

			VC_INFO.network_extNETWORK = tmpl.VC_NETWORK_ADDRESS;
			VC_INFO.network_extMASK = tmpl.VC_NETWORK_MASK;
			VC_INFO.network_extDNS = tmpl.VC_DNS;
			VC_INFO.network_extGATEWAY = tmpl.VC_GATEWAY;
		}
	}

}

function initTemplateParams(){

	//initialize availability array to ones (all available)
	//use this method to allow the selection of the subnet among all the available ones
	/*var subnets_availability_table = [];
	for (var i = 0; i < 256; i++ )
		subnets_availability_table.push(1);*/
	//use this second method to automatically find the lowest available subnet address
	VC_INFO.network_intsub24tail = checkNetworkAvailability(VC_INFO.network_intsub16prefix);
	if(VC_INFO.network_intsub24tail == -1){
		notifyError("Cannot instantiate the cluster on the selected virtual network: no free subnet found.");
		return;
	}	
	VC_INFO.network_intsub24prefix = VC_INFO.network_intsub16prefix + "." + 							VC_INFO.network_intsub24tail;
	VC_INFO.network_intsub24address = VC_INFO.network_intsub24prefix.concat(".0");
	VC_INFO.network_intsub24gw = VC_INFO.network_intsub24prefix.concat(".1");
	VC_INFO.network_intsub24mask = "255.255.255.0";

	//hosts string creation
	VC_INFO.context = {};
	VC_INFO.context.HOSTS_STRING = createHostsFile(	VC_INFO.master_NAME, 
							VC_INFO.worker_commonname, 
							VC_INFO.worker_count,
							VC_INFO.network_intsub24prefix );

	//now, start the loop for each template to clone
	VC_INFO.cloned_templates = {}; // { <hostname1> : [<t1_id>, <t1_name>], <hostname2> : [<t2_id>, <t2_name>],... }
	//(MASTER first...)
	//append a random string to avoid (have very small probability to have) duplicated template names
	var tname = "_tm" + VC_INFO.master_templateID + "_" + VC_INFO.master_NAME + "_" + randomStr(5) + "_";
	VC_INFO.cloned_templates[VC_INFO.master_NAME] = [VC_INFO.master_templateID, tname];
	Sunstone.runAction(	"Vcluster.template-clone", 
				VC_INFO.master_templateID, 
				tname);
	//(...then WORKERS)
	for(var index=1 ; index <= VC_INFO.worker_count ; index++){
		var wn_hostname = VC_INFO.worker_commonname.concat(index);
		tname = "_tw" + VC_INFO.worker_templateID + "_" + wn_hostname + "_" + randomStr(5) + "_"; 
		VC_INFO.cloned_templates[wn_hostname]  = [VC_INFO.worker_templateID, tname];
		Sunstone.runAction(	"Vcluster.template-clone", 
					VC_INFO.worker_templateID, 
					tname);
	}
	//List templates to gather their IDs
	Sunstone.runAction("Vcluster.template-list");

	VC_INFO.context.templates = {};
	//MASTER NODE context parameters	
	var mn_tid = VC_INFO.cloned_templates[VC_INFO.master_NAME][0];
	var net_params_mn = { 	"NETWORK_ID" : VC_INFO.network_intID, 
				"NETWORK_ADDRESS" : VC_INFO.network_intsub24address,
				"IP_ADDRESS" : VC_INFO.network_intsub24gw, 
				"NETWORK_MASK" : VC_INFO.network_intsub24mask,  
				"GATEWAY" : "",
				"DNS" : VC_INFO.network_intsub16dns };

	VC_INFO.context.templates[mn_tid] = {	"template_id" : mn_tid,
						"HOSTNAME" : VC_INFO.master_NAME,
						"int_network" : net_params_mn,
						"ROLE" : MASTER_ROLE};

	//WORKING NODES context parameters
	for(var index=1 ; index <= VC_INFO.worker_count ; index++){
		var wn_hostname = VC_INFO.worker_commonname.concat(index);
		var wn_tid = VC_INFO.cloned_templates[wn_hostname][0];
		var wn_addr = (VC_INFO.network_intsub24prefix + ".").concat(index+1);
		var net_params_wn = { 	"NETWORK_ID" : VC_INFO.network_intID, 
					"NETWORK_ADDRESS" : VC_INFO.network_intsub24address,
					"IP_ADDRESS" : wn_addr, 
					"NETWORK_MASK" : VC_INFO.network_intsub24mask,  
					"GATEWAY" : VC_INFO.network_intsub24gw,
					"DNS" : VC_INFO.network_intsub16dns };

		VC_INFO.context.templates[wn_tid] = {	"template_id" : wn_tid,
							"HOSTNAME" : wn_hostname,
							"int_network" : net_params_wn,
							"ROLE" : WORKER_ROLE};
	} //end for

	for(var id in VC_INFO.context.templates){
		Sunstone.runAction("Vcluster.template-info", id);
	}

}

//return the index of the first available subnet, or -1 if no subnet is available
function checkNetworkAvailability(net_prefix16){
	
	//ordered indexes of subnets
	var busy_sub24tails = calculateBusySubnets(parseIpList(net_prefix16));
	var j = 0;
	for(var i = 0; i <= 255; i++ ){
		if( j > busy_sub24tails.length || busy_sub24tails[j++] != i ){
			return i;
		}
	}
	return -1;
}

function gatherTemplatesIds(request, templates_list){

	updateTemplatesView(request, templates_list);

	$.each(templates_list,function(){
	});

	for(var hn_key in VC_INFO.cloned_templates){
		VC_INFO.cloned_templates[hn_key][0] = getValue(VC_INFO.cloned_templates[hn_key][1], 4, 1, dataTable_templates);
	}
}

//Vcluster.template-info callback
function editTemplateJSON(request, response){

	var template_json = response.VMTEMPLATE.TEMPLATE;
	template_to_update_id = response.VMTEMPLATE.ID;
	
	var cxt = VC_INFO.context;
	var tmpl_params = cxt.templates[template_to_update_id];

	template_json["NIC"] = [];
	delete template_json.CONTEXT.NETWORK;  //NO AUTOMATIC CONTEXTUALIZATION OF NETWORK PARAMETERS
	template_json["NIC"].push( {	"NETWORK_ID" : tmpl_params.int_network.NETWORK_ID, 
					"IP" : tmpl_params.int_network.IP_ADDRESS 
					} );

	template_json["CONTEXT"]["VCLUSTER_VMS_COUNT"] 	= 	VC_INFO.vcluster_VMS_COUNT;
	template_json["CONTEXT"]["VCLUSTER_HOSTS"] 	=	cxt.HOSTS_STRING;
	template_json["CONTEXT"]["VM_ROLE"] 		= 	tmpl_params.ROLE;
	template_json["CONTEXT"]["HOSTNAME"] 		= 	tmpl_params.HOSTNAME;
	template_json["CONTEXT"]["ETH0_IP"] 		= 	tmpl_params.int_network.IP_ADDRESS;
	template_json["CONTEXT"]["ETH0_NETWORK"] 	= 	tmpl_params.int_network.NETWORK_ADDRESS;
	template_json["CONTEXT"]["ETH0_MASK"] 		= 	tmpl_params.int_network.NETWORK_MASK;
	template_json["CONTEXT"]["DNS"]			=	VC_INFO.network_extDNS;

	//only for the external interface of the master
	if( tmpl_params.ROLE ==  MASTER_ROLE){
		template_json["NIC"].push( {	"NETWORK_ID" : VC_INFO.network_extID
						 } );
		template_json["CONTEXT"]["ETH1_IP"] 		= 	"$NIC[IP, NETWORK_ID=" + VC_INFO.network_extID + "]";
		template_json["CONTEXT"]["ETH1_NETWORK"] 	= 	VC_INFO.network_extNETWORK;
		template_json["CONTEXT"]["ETH1_MASK"] 		= 	VC_INFO.network_extMASK;
		template_json["CONTEXT"]["GATEWAY"] 		= 	VC_INFO.network_extGATEWAY;
	}
	else{//only for the (internal) interfaces of the workers
		template_json["CONTEXT"]["ETH0_GATEWAY"] = tmpl_params.int_network.GATEWAY;
	} 
	
	template_string = convert_template_to_string(template_json).replace(/^[\r\n]+$/g, "");
	template = {"vmtemplate": {"template_raw": template_string}};
	var vm_json = JSON.stringify(template);
	Sunstone.runAction("Vcluster.template-update",template_to_update_id,vm_json);

}

//Vcluster.template-update callback
function instantiateVm(request){

	var t_id = request.request.data[0][0];
	var hostname = VC_INFO.context.templates[t_id].HOSTNAME;
	notifySubmit("Template.instantiate",t_id);
	var extra_info = {"vm_name" : hostname};
	Sunstone.runAction("Template.instantiate_quiet", t_id, extra_info);
}

function createVcluster(){
	
	//Now, search for new vms in the datatable and associate them to the vcluster
	var vms_ids = getValue_belongsToVC(VC_INFO.vcluster_vcname, 4, 1, dataTable_vMachines); //TODO: try to extract vms_ids from template instantiation response
	var master_id;
	var workers_ids = [];

	for (var i=0; i< vms_ids.length; i++){

		var vm_id = vms_ids[i];
		var vm_name = getName(vm_id, dataTable_vMachines, 4);
		if( vm_name == VC_INFO.master_NAME){ //it's the master node
			master_id = vm_id;
		}
		else{ //it's a worker node
			workers_ids.push(vm_id);
		}
	}

	VC_INFO.vcluster_json = 
		{ "vcluster": { 
			"name": 	VC_INFO.vcluster_vcname, 
			"vms" : {
				"master" : 	master_id,
				"workers" : 	workers_ids
			},
			"networks" : {
				"internal" : {
					"id" : 		VC_INFO.network_intID,
					"netaddr24" : 	VC_INFO.network_intsub24address,
					"mask24" : 	VC_INFO.network_intsub24mask,
					"gateway24" : 	VC_INFO.network_intsub24gw,
					"dns" : 	VC_INFO.network_intsub16dns,
					"tail24" :	VC_INFO.network_intsub24tail.toString()
				},
				"extern" : {
					"id" : 		VC_INFO.network_extID,
					"netaddr" : 	VC_INFO.network_extNETWORK,
					"mask" : 	VC_INFO.network_extMASK,
					"gateway" : 	VC_INFO.network_extGATEWAY,
					"dns" : 	VC_INFO.network_extDNS
				}
			}
		}
        };

	Sunstone.runAction("Vcluster.create", VC_INFO.vcluster_json);

}

//Updates the host info panel tab content and pops it up
function updateVclusterInfo(request,vcluster){

    monitor_global_series = {};
    var vcluster_id = vcluster.VCLUSTER.ID;
    var vcluster_info = JSON.parse( vcluster.VCLUSTER.TEMPLATE.BODY );
    var vcluster_name = vcluster_info.vcluster.name;

    //Information tab
    var vms_ids = parseVmsOfVcluster(vcluster_info);

    var vms_content = '';
    for (var i=0; i<vms_ids.length;i++){
    	vms_content += '<tr>\
			  <td class="value_td">'+vms_ids[i]+'</td>\
			  <td class="value_td">'+getValue(vms_ids[i], 1, 4, dataTable_vMachines)+'</td>\
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
                <td class="value_td">'+vcluster_id+'</td>\
            </tr>\
            <tr>\
                <td class="key_td">' + tr("Name") + '</td>\
                <td class="value_td">'+vcluster_name+'</td>\
            </tr>\
            <tr>\
                <td class="key_td">' + tr("Internal network") + '</td>\
                <td class="value_td">'+getName(vcluster_info.vcluster.networks.internal.id, dataTable_vNetworks, 4)+'</td>\
            </tr>\
            <tr>\
                <td class="key_td">' + tr("External network") + '</td>\
                <td class="value_td">'+getName(vcluster_info.vcluster.networks.extern.id, dataTable_vNetworks, 4)+'</td>\
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
            content : printVclusterVms(vcluster_id)
    };
    
    Sunstone.updateInfoPanelTab("vcluster_info_panel","vcluster_info_tab",info_tab);
    Sunstone.updateInfoPanelTab("vcluster_info_panel","vcluster_monitoring_tab",monitor_tab);
    Sunstone.updateInfoPanelTab("vcluster_info_panel","vcluster_vms_tab",vms_tab);

    var clustered_vms = vmsOfVcluster(vcluster_id);
    for (var j=0;j<clustered_vms.length;j++){	
    	if(clustered_vms[j] == Math.max.apply(null, clustered_vms)){
	    		Sunstone.runAction("Vcluster.monitor_vm",clustered_vms[j],
					{ monitor_resources : "CPU,MEMORY,NET_TX,NET_RX"});
    	}
   	}
    
    Sunstone.popUpInfoPanel("vcluster_info_panel", "vclusters-tab");
    
    $("#vcluster_info_panel_refresh", $("#vcluster_info_panel")).click(function(){
        $(this).html(spinner);
        Sunstone.runAction('Vcluster.showinfo', vcluster_id);
      });
    
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
    }
    else{ //prepare plot
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
	    $.plot(info.div_graph,monitor_global_series[graph_name],options); //call to flot lib
    }
    	
};

function addToGlobalSeries(series, vm_id, graph_id){
	
	if( nextVm(vm_id) > 0 && monitor_global_series[graph_id]){
		res = monitor_global_series[graph_id];
		for(var k=0;k<res.length;k++){
			res_data = res[k].data;
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
	
	dataTable_vcluster_vms.fnFilter('',1,true,true,false,true);
	
	return html_content;

}

//Updates the select input field with an option for each template
function vc_updateTemplateSelect(){
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
    $create_vcluster_dialog = $('#create_vcluster_dialog');
    var dialog = $create_vcluster_dialog;

    dialog.html(create_vcluster_tmpl);
    dialog.addClass("reveal-modal large max-height");

    setupTips(dialog);

    //Handle the form submission
    $('#create_vcluster_form',dialog).submit(function(){
        var vcname = $('#vcname',this).val();
        var template_mn = $('select#template_mn',this).val();
        var template_wn = $('select#template_wn',this).val();
        var wnn = $('#wnn',this).val();
	var virt_net_ext_id = $('select#virt_net_ext_id',this).val();
	var virt_net_int_id = $('select#virt_net_int_id',this).val();
	var sub_addr = $('#sub_addr',this).val();
        var n_times_int = 1;
	//var sub_addr_int = 1;

        if (!vcname){
            notifyError(tr("Virtual Cluster name missing!"));
            return false;
        }
        if (!template_mn){
            notifyError(tr("You have not selected a template for master node"));
            return false;
        };

        if (!virt_net_ext_id){
            notifyError(tr("You have not selected the virtual network for the public interface of the master node"));
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
        if (!virt_net_int_id){
            notifyError(tr("You have not selected the virtual network for the dedicated subnet"));
            return false;
        };
	if (virt_net_int_id == virt_net_ext_id){
            notifyError(tr("Please, specify a dedicated network other than the external one"));
            return false;
        };

        //if (sub_addr && parseInt(sub_addr,10)<=255 && parseInt(sub_addr,10)>=0){
        //    sub_addr_int = parseInt(sub_addr,10);
        //}
        //else{
        //    notifyError(tr("Please, insert a valid number for the dedicated /24 subnet [0 to 255]"));
        //    return false;
        //};
       
        VC_INFO.vcluster_VMS_COUNT = n_times_int + 1;
        VC_INFO.vcluster_vcname = vcname;
	VC_INFO.master_suffix = master_suffix;
	VC_INFO.master_NAME = vcname.concat(master_suffix);
        VC_INFO.master_templateID = template_mn;
	VC_INFO.worker_suffix = worker_suffix;
	VC_INFO.worker_commonname = vcname.concat(worker_suffix);	
        VC_INFO.worker_templateID = template_wn;
        VC_INFO.worker_count = n_times_int;
	VC_INFO.network_extID = virt_net_ext_id;
	VC_INFO.network_intID = virt_net_int_id;
	//VC_INFO.network_intsub24tail = sub_addr_int; //actually it is automatically assigned
        
        $create_vcluster_dialog.trigger("reveal:close");
        
// ############################################ SYNCHRONOUS REQUESTS ############################################ 
	switchToSync();
	//first we extract the informations of the selected virtual networks (internal and extern)
	//and check if they're complete and correct
	var is_ok = getNetworkInfo();
	if(!is_ok){
		return false;
	}
        initTemplateParams();
	Sunstone.runAction("VM.list");
	createVcluster();
	switchToAsync();
// ######################################### SYNCHRONOUS REQUESTS - END  ######################################## 

	for(var t_id in VC_INFO.context.templates){
		Sunstone.runAction("Vcluster.template-delete", [t_id]);
	}
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
	vc_updateTemplateSelect();
	vc_updateVnetsSelect();
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
	if(vclusterVmJSON[vm])
	
    return vms_select;
}

function vc_updateVnetsSelect() {
    var vnets_select =
        makeSelectOptions(dataTable_vNetworks,
                          1,//id_col
                          4,//name_col
                          [],//status_cols
                          []//bad status values
                         );

    //update static selectors:
    $('#virt_net_ext_id', $create_vcluster_dialog).html(vnets_select);
    $('#virt_net_int_id', $create_vcluster_dialog).html(vnets_select);

}

//========================= UTILITIES ========================================

//Taken from getValue function in sunstone-util plugin
//Search a datatable record where the filter_str in the filter_col indicates
//that the vm belongs to the relative virtual cluster. 
//Returns the value of that record in the desired value column.
function getValue_belongsToVC(filter_str,filter_col,value_col,dataTable){

	 var values = [];
	 if (typeof(dataTable) == "undefined") return values;
	 var nodes = dataTable.fnGetData();
	 $.each(nodes,function(){
		var string = this[filter_col];
		if (string.match("^"+filter_str+master_suffix+"$") || string.match("^"+filter_str+worker_suffix+"[0-9]+$") ){
			values.push(this[value_col]);
		}
	 });
	 return values;
};

//temporary utilities to switch from async requests (default behaviour) to sync requests.
function switchToSync(){

	$.ajaxSetup({
	  converters: {
	    "text json": function( textValue ) {
	      return jQuery.parseJSON(jQuery('<div/>').text(textValue).html());
	    }
	  },
	  async: false
	});

}

function switchToAsync(){

	$.ajaxSetup({
	  converters: {
	    "text json": function( textValue ) {
	      return jQuery.parseJSON(jQuery('<div/>').text(textValue).html());
	    }
	  },
	  async: true
	});

}
// END OF - temporary utilities

function parsePrefix(net_addr, netmask){

	var addr_arr = net_addr.toString().split(".");
	var mask_arr = netmask.toString().split(".");

	for( var i=mask_arr.length-1; i >= 0 ; i-- ){
		if (mask_arr[i] == 0)
			addr_arr.pop();
	}

	return (addr_arr.join()).replace(/,/g,".");
}

function parseIpList(net_prefix){

	var ip_list1 = [];

	//get existing VMs' IP addresses
        $.each($(dataTable_vMachines.fnGetNodes()),function(){
		// 7 is the index of the IPs column
		var row_str = $($('td',this)[7]).html();
		ip_list1 = ip_list1.concat( parseIps( row_str ) );
        });
	
	//now filter the IPs matching the network prefix of the vnet created for the virtual clusters
	return filterIpListByPrefix(ip_list1, "^" + net_prefix);

}

function parseIps(str){
	var ipv4regex = "(?:[0-9]{1,3}\.){3}[0-9]{1,3}";
	var regex = new RegExp( ipv4regex, 'g');
	var ret_list = str.match(regex);
	return ret_list;
}

//calculate ordered and unique indexes of busy subnets
function calculateBusySubnets(usedIpsList){
	
	//take the third number of each filtered IP for the /24 subnetting
	var ret_list = [];
	$.each(usedIpsList, function(){
		ret_list.push( this.toString().split(".")[2] );
        });
	//now it is possible to mark the already taken subnets
	ret_list = sort_unique(ret_list);
	
	return ret_list;	
}

function filterIpListByPrefix(list, prefix_str){
	var filtered = [];
	var regex = new RegExp( prefix_str );

	$.each(list, function(){
		if( this.toString().match(regex) )
			filtered.push(this.toString());
        });
	return filtered;
}

function sort_unique(arr) {
    arr = arr.sort(function (a, b) { return a*1 - b*1; });
    var ret = [arr[0]];
    for (var i = 1; i < arr.length; i++) { // start loop at 1 as element 0 can never be a duplicate
        if (arr[i-1] !== arr[i]) {
            ret.push(arr[i]);
        }
    }
    return ret;
}

function randomStr(chars_num){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < chars_num; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function createHostsFile(master_name, worker_comm_name, tot_workers, net_prefix){

	var gw_addr = VC_INFO.network_intsub24gw;
	var master_addr = gw_addr ? gw_addr : net_prefix;
	var hosts_str = master_name + "\t" + master_addr + "\n";

	for(var i=1; i <= tot_workers; i++){
		hosts_str += (worker_comm_name.concat(i)) + "  \t" + (net_prefix + ".").concat(i+1)  + "\n";
	}

	return hosts_str;
}


//================================================================================

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
