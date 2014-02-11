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

require 'opennebula/document_json'

module OpenNebula
    class VirtualCluster < DocumentJSON

        DOCUMENT_TYPE = 2001

	def info
		rc = super()
		if OpenNebula.is_error?(rc)
			return rc
		end

		doc_hash = self.to_hash

		vc_json = JSON.parse('{ "VCLUSTER" : {} }')

		if doc_hash["DOCUMENT"]
			vc_json["VCLUSTER"] = doc_hash["DOCUMENT"]
		end

		return vc_json
			
	end

    end
end


