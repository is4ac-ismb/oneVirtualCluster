oneVirtualCluster
=================

The Virtual Cluster Plugin for OpenNebula is developed by IS4AC Research Unit of ISMB an applied Research Center located in Turin (Italy), see www.ismb.it. This plugin allows users to deploy and manage virtual cluster directly from Sunstone GUI. It is possible to specify a master node and an arbitrary number of compute nodes that will be deployed with easy steps and standard OpenNebula actions.

Actually, the plugin is suitable for the versions of Sunstone included in Open Nebula 4.0.1 and 4.2.0 and for the SQLite database.

Reference to OpenNebula folders:
- Open Nebula installation: /usr/lib/one/
- Open Nebula ruby folder: /usr/lib/one/ruby/
- OpenNebula ruby/opennebula/ folder: /usr/lib/one/ruby/opennebula/ 
- Sunstone installation: /usr/lib/one/sunstone
- Sunstone models folder: /usr/lib/one/sunstone/models/
- Sunstone javascript folder: /usr/lib/one/sunstone/public/js/
- Sunstone plugins folder: /usr/lib/one/sunstone/public/js/plugins/


==================
<b>Plugin installation instructions</b>
==================


Changed files.
Replace the following files with those provided by the plugin:
- SunstoneServer.rb in the models folder of Sunstone installation;
- OpenNebulaJSON.rb in the ruby folder of Open Nebula installation;
- opennebula.js in the public/js/ folder of Sunstone installation;
- OpenNebula.rb (opennebula.rb for version ≥ 4.0.1) in the ruby folder of Open Nebula installation.

==================
New files.
Add the following files:
- vclusters-tab.js in the plugins folder of Sunstone installation;
- VirtualClusterJSON.rb in the ruby/OpenNebulaJSON folder of Open Nebula installation;
- virtual_cluster.rb in the ruby/opennebula/ folder of Open Nebula installation.

==================
Database changes.
Manually execute the following queries to one.db:
  - virtual_cluster_pool table creation:
    CREATE TABLE virtual_cluster_pool (oid INTEGER PRIMARY KEY, name VARCHAR(128), body TEXT, uid INTEGER, gid INTEGER, owner_u INTEGER, group_u INTEGER, other_u INTEGER, UNIQUE(name)); 
  - vcluster_vm_control table creation (to manage vms-vclusters associations):
   CREATE TABLE vcluster_vm_control (vm_id INTEGER PRIMARY KEY REFERENCES vm_pool(oid) ON DELETE CASCADE, vcluster_id INTEGER REFERENCES virtual_cluster_pool(oid) ON DELETE CASCADE); 
  - Row for virtual cluster pool in pool_control the table:
    INSERT INTO pool_control VALUES('virtual_cluster_pool', '0');

==================
Plugin tab registration.
Register the virtual cluster tab in Sunstone. 
Insert the vclusters-tab row entry in the available_tabs section of the file /etc/one/sunstone-views.yaml.
Insert the vclusters-tab row entry at the first part of the file /etc/one/sunstone-views/<view_name>.yaml for the views you want the plugin to be enabled, between the files-tab and infra-tab entries as shown below:

In the same files, append the following lines  under the vresources-tab and  before the “infra-tab:” row.

    vclusters-tab: 
        panel_tabs: 
            vcluster_info_tab: true 
            vcluster_monitoring_tab: true 
            vcluster_vms_tab: true 
        table_columns: 
            - 0         # Checkbox 
            - 1         # ID 
            - 2         # Name 
            - 3         # Virtual Machines 
        actions: 
            Vcluster.create: true 
            Vcluster.create_dialog: true 
            Vcluster.refresh: true 
            Vcluster.autorefresh: true 
            Vcluster.list: true 
            Vcluster.help: true 
            Vcluster.showinfo: true 
            Vcluster.addvm: true 
            Vcluster.delete: true 
            Vcluster.monitor_vm: true 

If you still haven't customized the admin view (admin.yaml file), you can replace it with the one provided inside the plugin folder.


