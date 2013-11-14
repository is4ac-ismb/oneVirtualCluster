# -------------------------------------------------------------------------- #
# Copyright 2002-2013, OpenNebula Project Leads (OpenNebula.org)			 #
#																			#
# Licensed under the Apache License, Version 2.0 (the "License"); you may	#
# not use this file except in compliance with the License. You may obtain	#
# a copy of the License at												   #
#																			#
# http://www.apache.org/licenses/LICENSE-2.0								 #
#																			#
# Unless required by applicable law or agreed to in writing, software		#
# distributed under the License is distributed on an "AS IS" BASIS,		  #
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   #
# See the License for the specific language governing permissions and		#
# limitations under the License.											 #
#--------------------------------------------------------------------------- #
# Created by:
# Antonio Attanasio - attanasio@ismb.it
# IS4AC @ ISMB - www.ismb.it

require 'OpenNebulaJSON/JSONUtils'
require 'sqlite3'


module OpenNebulaJSON
	class VirtualClusterJSON < OpenNebula::VirtualCluster
		include JSONUtils

	protected

		# node:: _XML_is a XML element that represents the Pool element
		# client:: _Client_ represents a XML-RPC connection
		def initialize(node, client)
			@xml	= node
			@client = client

			if self['ID']
				@pe_id = self['ID'].to_i
			else
				@pe_id = nil
			end
			@name = self['NAME'] if self['NAME']

		end
		
	public 


	def create(template_json)
		
		cluster_hash = parse_json(template_json, 'vcluster')
#File.open("/var/log/one/out.txt", 'a') {|f| f.write("\nTemplate JSON:\n" + template_json + "\n") }
		if OpenNebula.is_error?(cluster_hash)
			return cluster_hash
		end

		vcluster_name =  cluster_hash['name']
		next_oid = (Integer(last_oid) + 1)
		next_oid_string = next_oid.to_s

		r = execute_query "INSERT INTO virtual_cluster_pool VALUES('" + next_oid_string + "', '" + vcluster_name + "', 'NO_XML', 0, 0, 1, 0, 0)"
		unless r.is_a?(SQLite3::Exception)
			execute_query "UPDATE pool_control SET last_oid='" + next_oid_string +"' WHERE tablename='virtual_cluster_pool'"
		end

		new_cluster_hash = JSON.parse(template_json)
		new_cluster_hash['vcluster']['id'] = next_oid_string
		
#File.open("/var/log/one/out.txt", 'a') {|f| f.write("\nTemplate JSON:\n" + JSON.pretty_generate(new_cluster_hash) + "\n") }

		return new_cluster_hash
	
	end

	def self.get_pool(xml, client)

		vc = self.new xml, client

		json_complete = "{\"VCLUSTER_POOL\":{ \"VCLUSTER\": ["
		#query to retrieve virtual_clusters info (name, id)
		query1 = "SELECT oid, name FROM virtual_cluster_pool"

		rs1 = vc.execute_query query1 
		
		#for each vcluster
			#query to retrieve its vms
			#build vms json
		rs1.each do |row1|
			json_complete += "{"
			vcluster_id = row1[0].to_s
			json_id =  "\"ID\":\"" + vcluster_id + "\""
			vcluster_name = row1[1].to_s
			json_name = "\"NAME\":\"" + vcluster_name + "\","
#File.open("/var/log/one/out.txt", 'a') {|f| f.write("\n\n vcluster data extracted:\n" + vcluster_id + " " + vcluster_name + "\n:end\n\n") }
			json_vms = "\"VMS\":{\"ID\":[" 
			query2 = "SELECT vm_id FROM vcluster_vm_control WHERE vcluster_id='" + vcluster_id + "'"
			rs2 = vc.execute_query query2
			#build single vm id string
			rs2.each do |row2|
				json_singlevm = "\"" + row2[0].to_s + "\","
				json_vms += json_singlevm
			end
			if json_vms[-1].chr == ','
				json_vms = json_vms[0...-1]
			end
			json_vms += "]},"
			json_complete += (json_vms + json_name + json_id + "},")
		end
		if json_complete[-1].chr == ','
			json_complete = json_complete[0...-1]
		end
		json_complete += "]}}"

		r = JSON.pretty_generate(JSON.parse(json_complete))

#File.open("/var/log/one/out.txt", 'a') {|f| f.write("\n\n JSON VCLUSTERS:\n" + json_complete +  "\n:end\n\n") }
#File.open("/var/log/one/out.txt", 'a') {|f| f.write("\n\n JSON VCLUSTERS:\n" + JSON.parse(json_complete).values.inspect +  "\n:end\n\n") }
#File.open("/var/log/one/out.txt", 'a') {|f| f.write("\n\n JSON VCLUSTERS:\n" + r +  "\n:end\n\n") }

		return r

	end

	def self.get_vcluster(vcluster_id, xml, client)

		vc = self.new xml, client

		#get vcluster name
		vcluster_name = vc.execute_query "SELECT name FROM virtual_cluster_pool WHERE oid = '" + vcluster_id + "'", "first_value"		

		json_complete = "{ \"VCLUSTER\": {"

		json_id =  "\"ID\":\"" + vcluster_id + "\""
		json_name = "\"NAME\":\"" + vcluster_name + "\","

		#get vms info
		json_vms = "\"VMS\":{\"ID\":[" 
		query2 = "SELECT vm_id FROM vcluster_vm_control WHERE vcluster_id='" + vcluster_id + "'"
		rs2 = vc.execute_query query2
		#build single vm id string
		rs2.each do |row2|
			json_singlevm = "\"" + row2[0].to_s + "\","
			json_vms += json_singlevm
		end
		if json_vms[-1].chr == ','
			json_vms = json_vms[0...-1]
		end
		json_vms += "]},"
		json_complete += (json_vms + json_name + json_id + "}}")

		r = JSON.pretty_generate(JSON.parse(json_complete))

#File.open("/var/log/one/out2.txt", 'a') {|f| f.write("\n\n ACTION JSON:\n" + r +  "\n:end\n\n") }

		return r

	end

	def	self.delete_vcluster(vcluster_id, xml, client)
#File.open("/var/log/one/out2.txt", 'a') {|f| f.write("\n\n	ENTRATO \n\n" + vcluster_id + "\n") }
		vc = self.new xml, client
		
		resource = get_vcluster(vcluster_id, xml, client)
		
		vc.execute_query "DELETE FROM virtual_cluster_pool WHERE oid='" + vcluster_id + "'"
		vc.execute_query "DELETE FROM vcluster_vm_control WHERE vcluster_id='" + vcluster_id + "'"

		return resource

	end


	def self.perform_action(vcluster_id, action_json, xml, client)

#File.open("/var/log/one/out.txt", 'a') {|f| f.write("\n\n ACTION JSON:\n" + action_json +  "\n:end\n\n") }

		vc = self.new xml, client
		json = JSON.parse(action_json)

		action_type = json["action"]["perform"]
		vm_id = json["action"]["params"]["vm_id"]

		case action_type
			when "addvm" then	vc.vcluster_vm_assoc(vcluster_id, vm_id)	
			
			else
				error = Error.new("Error: #{action_type} action not supported")
				return [404, error.to_json]
		end

	end

############################################################################################################
#####################------------------------------------------------------------------#####################
#########------------------------------  DATABASE UTILITY FUNCTIONS -------------------------------#########
#####################------------------------------------------------------------------#####################
############################################################################################################

	#This function retrieves the highest oid assigned to a virtual cluster row in the virtual_cluster_pool table
	#the value is stored into pool_control table, like other IDs
	def last_oid
		execute_query "SELECT last_oid FROM pool_control WHERE tablename='virtual_cluster_pool'", "first_value"
	end


	#This function associates a virtual machine with the virtual cluster it belongs to
	def vcluster_vm_assoc(vcluster_id, vm_id)
#File.open("/var/log/one/out.txt", 'a') {|f| f.write("\n\n ADDVM QUERY:\n" + vcluster_id + " " + vm_id +  "\n:end\n\n") }
		query = "INSERT INTO vcluster_vm_control VALUES('" + vm_id + "', '" + vcluster_id + "')"
		r = execute_query query
		if r.is_a? SQLite3::Exception
			#TODO: raise exception: vm already assigned
		end

	end	

	#This function should be used to execute a generic query into the database
	def execute_query(query,type=nil)

		db = SQLite3::Database.open("/var/lib/one/one.db")
		
#File.open("/var/log/one/out.txt", 'a') {|f| f.write( "\nQUERY:\n" + query + "\n\n")}	

		r = case type
				when "first_value" then db.get_first_value query
				else db.execute query
			end	
		
#File.open("/var/log/one/out.txt", 'a') {|f| f.write( "\nReturn value:\n" + r.to_s + "\n")}	
		
		rescue SQLite3::Exception => e 
#File.open("/var/log/one/out.txt", 'a') {|f| f.write( "\nDatabase exception:\n" + e + "\n")}
		r = e
		else 
#File.open("/var/log/one/out.txt", 'a') {|f| f.write( "\nNo database exception\n")}

		ensure
			db.close if db
		
		return r
		
		end

	end
end
