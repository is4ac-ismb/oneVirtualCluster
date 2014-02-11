oneVirtualCluster 2.0
=================

By february 7, 2014 the 2.0 version of Virtual Cluster Plugin is available for download at our github repository. The new version can be installed without any modification neither to the basic Open Nebula and Sunstone code nor to the database.


The Virtual Cluster Plugin for OpenNebula is developed by IS4AC Research Unit of ISMB an applied Research Center located in Turin (Italy), see www.ismb.it. This plugin allows users to deploy and manage virtual cluster directly from Sunstone GUI. It is possible to specify a master node and an arbitrary number of compute nodes that will be deployed with easy steps and standard OpenNebula actions. In this way, the user can quickly setup a set of VMs according to a Beowulf cluster architecture. The templates of the nodes are updated just before the deployment, to transmit to each VM the information needed to configure the networking with other nodes of the cluster.

Actually, the plugin is suitable for the versions of Sunstone included in Open Nebula 4.0.1 and 4.2.0 and for the SQLite database.

Reference to OpenNebula folders:
- Open Nebula installation: /usr/lib/one/
- OpenNebula ruby/opennebula/ folder: /usr/lib/one/ruby/opennebula/
- Sunstone installation: /usr/lib/one/sunstone
- Sunstone routes folder: /usr/lib/one/sunstone/routes/
- Sunstone plugins folder: /usr/lib/one/sunstone/public/js/plugins/ 


==================
<b>Plugin installation instructions</b>
==================

Add the following files:
- vclusters-tab.js in the plugins folder of Sunstone installation;
- virtual-cluster.rb in the routes folder of Sunstone installation;
- virtual_cluster.rb in the ruby/opennebula/ folder of Open Nebula installation.
- virtual_cluster_pool.rb in the ruby/opennebula/ folder of Open Nebula installation. 


==================
<b>Plugin registration</b>

To add the server side portion of the plugin, edit /etc/one/sunstone-server.conf adding virtual-cluster entry under the ”:routes:” label as shown below:

    [...]  
    :routes:  
    [...]  
      \- virtual-cluster

To register the virtual cluster tab in Sunstone, insert the vclusters-tab row entry in the available_tabs section of the file /etc/one/sunstone-views.yaml, as shown below:

    available_tabs:  
      [...]  
      files-tab  
      vclusters-tab  
      infra-tab  
      [...]  

Insert the vclusters-tab row entry at the first part of the file /etc/one/sunstone-views/<view_name>.yaml for the views you want the plugin to be enabled, between the files-tab and infra-tab entries as shown below:

    enabled_tabs:  
      [...]  
      files-tab: true  
      vclusters-tab: true  
      infra-tab: true  
      [...]  

In the same files, append the following lines under the vresources-tab and before the infra-tab row.

    [...]  
    tabs:  
      [...]  
        vclusters-tab:   
          panel_tabs:   
              vcluster_info_tab: true   
              vcluster_monitoring_tab: true   
              vcluster_vms_tab: true   
        table_columns:   
            \- 0         # Checkbox   
            \- 1         # ID   
            \- 2         # Name   
            \- 3         # Virtual Machines  
            \- 4         # Internal Network  
            \- 5         # External Network  
        actions:   
            Vcluster.create: true   
            Vcluster.create_dialog: true   
            Vcluster.refresh: true   
            Vcluster.autorefresh: true   
            Vcluster.list: true   
            Vcluster.help: true   
            Vcluster.showinfo: true   
            Vcluster.delete: true   
            Vcluster.monitor_vm: true   
      [...]  
  

If you still haven't customized the admin view (admin.yaml) and the sunstone-views.yaml files, you can replace them with those provided inside the plugin folder.
