# -------------------------------------------------------------------------- #
# Copyright 2002-2013, OpenNebula Project Leads (OpenNebula.org)             #
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
# Created by:
# Antonio Attanasio - attanasio@ismb.it
# IS4AC @ ISMB - www.ismb.it

require 'opennebula/pool'

module OpenNebula
    class VirtualCluster < PoolElement
        #######################################################################
        # Constants and Class Methods
        #######################################################################

        VIRTUAL_CLUSTER_METHODS = {
            :info           => "vcluster.info",
            :allocate       => "vcluster.allocate",
            :delete         => "vcluster.delete",
            :update         => "vcluster.update",
            :addvm        => "vcluster.addvm",
            :delvm        => "vcluster.delvm",
        }

        # Creates a Virtual Cluster description with just its identifier
        # this method should be used to create plain Virtual Cluster objects.
        # +id+ the id of the host
        #
        # Example:
        #   vcluster = VirtualCluster.new(VirtualCluster.build_xml(3),rpc_client)
        #
        def VirtualCluster.build_xml(pe_id=nil)
            if pe_id
                virtual_cluster_xml = "<VIRTUAL_CLUSTER><ID>#{pe_id}</ID></VIRTUAL_CLUSTER>"
            else
                virtual_cluster_xml = "<VIRTUAL_CLUSTER></VIRTUAL_CLUSTER>"
            end

            XMLElement.build_xml(virtual_cluster_xml,'VCLUSTER')
        end

        # Class constructor
        def initialize(xml, client)
            super(xml,client)
        end

		#######################################################################
        # XML-RPC Methods for the Virtual Cluster Object
        #######################################################################

        # Retrieves the information of the given Virtual Cluster.
        def info()
            super(VIRTUAL_CLUSTER_METHODS[:info], 'VCLUSTER')
        end

        # Allocates a new Virtual Cluster in OpenNebula
        #
        # +clustername+ A string containing the name of the Virtual Cluster.
        def allocate(virtualclustername)
            super(VIRTUAL_CLUSTER_METHODS[:allocate], virtualclustername)
        end

        # Deletes the Virtual Cluster
        def delete()
            super(VIRTUAL_CLUSTER_METHODS[:delete])
        end


        # Replaces the template contents
        #
        # @param new_template [String] New template contents
        #
        # @return [nil, OpenNebula::Error] nil in case of success, Error
        #   otherwise
        def update(new_template)
            super(VIRTUAL_CLUSTER_METHODS[:update], new_template)
        end

	
		# Adds a Virtual Machine to this Virtual Cluster
        # @param hid [Integer] Host ID
        # @return [nil, OpenNebula::Error] nil in case of success, Error
        #   otherwise
        def addvm(vmid)
            return Error.new('ID not defined') if !@pe_id

            rc = @client.call(VIRTUAL_CLUSTER_METHODS[:addvm], @pe_id, vmid)
            rc = nil if !OpenNebula.is_error?(rc)

            return rc
        end

        # Deletes a Virtual Machine from this Virtual Cluster
        # @param hid [Integer] Host ID
        # @return [nil, OpenNebula::Error] nil in case of success, Error
        #   otherwise
        def delvm(vmid)
            return Error.new('ID not defined') if !@pe_id

            rc = @client.call(VIRTUAL_CLUSTER_METHODS[:delvm], @pe_id, vmid)
            rc = nil if !OpenNebula.is_error?(rc)

            return rc
        end


    end
end
