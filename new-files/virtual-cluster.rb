# -------------------------------------------------------------------------- #
#									     #
# Created by:								     #
# Antonio Attanasio - attanasio@ismb.it					     #
# IS4AC @ ISMB - www.ismb.it						     #
#                                                                            #
# Licensed under the Apache License, Version 2.0 (the "License"); you may    #
# not use this file except in compliance with the License. You may obtain    #
# a copy of the License at                                                   #
#                                                                            #
# http://www.apache.org/licenses/LICENSE-2.0                                 #
#                                                                            #
# Unless required by applicable law or agreed to in writing, software        #
# distributed under the License is distributed on an "AS IS" BASIS,          #
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   #
# See the License for the specific language governing permissions and        #
# limitations under the License.                                             #
#--------------------------------------------------------------------------- #

require 'opennebula/virtual_cluster'
require 'opennebula/virtual_cluster_pool'

require 'OpenNebulaJSON/JSONUtils'
include JSONUtils

require 'opennebula'
include OpenNebula

##############################################################################
# Helpers
##############################################################################

helpers do

	def vcluster_build_client
		@vcluster_client = $cloud_auth.client(session[:user])
	end

end

##############################################################################
# GET Virtual Cluster Pool information  				OK
##############################################################################
get '/vcluster' do

	vcluster_build_client
	resource_pool = VirtualClusterPool.new(@vcluster_client, OpenNebula::Pool::INFO_ALL)

	rc = resource_pool.info

	if OpenNebula.is_error?(rc)
		return [500, rc.to_json]
	end

	return [200, rc.to_json]

end

##############################################################################
# GET Virtual Cluster information					OK
##############################################################################

get '/vcluster/:id' do

	vcluster_build_client
	virtual_cluster = VirtualCluster.new_with_id(params[:id], @vcluster_client)

	rc = virtual_cluster.info

	if OpenNebula.is_error?(rc)
		return [500, rc.message]
	end

	return [200, rc.to_json]

end

##############################################################################
# Delete Virtual Cluster						OK
##############################################################################
delete '/vcluster/:id' do

	vcluster_build_client
	virtual_cluster = VirtualCluster.new_with_id(params[:id], @vcluster_client)

	rc = virtual_cluster.delete

	if OpenNebula.is_error?(rc)
		return [500, rc.message]
	end

	return 204

end

##############################################################################
# Create a new Virtual Cluster						 OK
##############################################################################
post '/vcluster' do

	vcluster_build_client
	resource = VirtualCluster.new(VirtualCluster.build_xml, @vcluster_client)

	begin
		rc = resource.allocate(request.body.read)
	rescue JSON::ParserError
		error 400, $!.message
	end

	if OpenNebula.is_error?(rc)
		return [500, rc.to_json]
	end

	resource.info
	return [201, resource.to_json]

end

##############################################################################
# Perform an action on a Virtual Cluster
##############################################################################
#post '/vcluster/:id/action' do

#	vcluster_build_client
#	return [204, VirtualClusterJSON.perform_action(params[:id], request.body.read, Group.build_xml, @vcluster_client)]
#end

