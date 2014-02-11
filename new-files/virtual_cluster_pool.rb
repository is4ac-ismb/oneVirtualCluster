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

require 'opennebula/document_pool_json'

module OpenNebula
    class VirtualClusterPool < DocumentPoolJSON

        DOCUMENT_TYPE = 2001

        def factory(element_xml)
		vc_template = OpenNebula::VirtualCluster.new(element_xml, @client)
		vc_template.load_body
		vc_template
        end

	def info
		rc = super()
		if OpenNebula.is_error?(rc)
			return rc
		end

		docpool_hash = self.to_hash

		vcpool_json = JSON.parse('{"VCLUSTER_POOL" : {"VCLUSTER" : [] } }')

		if docpool_hash['DOCUMENT_POOL'] && docpool_hash["DOCUMENT_POOL"]["DOCUMENT"]
			if !docpool_hash['DOCUMENT_POOL']['DOCUMENT'].instance_of?(Array)
				    array = [docpool_hash['DOCUMENT_POOL']['DOCUMENT']]
				    docpool_hash['DOCUMENT_POOL']['DOCUMENT'] = array.compact
			end

			docpool_hash["DOCUMENT_POOL"]["DOCUMENT"].each { |doc| 
				vcpool_json["VCLUSTER_POOL"]["VCLUSTER"].push(doc) }
		end

		return vcpool_json
		
	end

    end
end

