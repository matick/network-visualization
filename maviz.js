var MAViz = function (opts) {
	var url = opts.url;
	var networkContainer = opts.networkContainer;
	var treeContainer = opts.treeContainer;
	
	var networkOptions = {
		edges: {
			style: "arrow",
			arrowScaleFactor: 0.4,
			widthMax: 6
		}
	};
	
	var treeOptions = {
		hierarchicalLayout: {
			layout: "direction"
		},
		edges: {
			style: "arrow",
			arrowScaleFactor: 0.4
		}
	};
	
	var treeNodes = new vis.DataSet();
	var treeEdges = new vis.DataSet();
	
	function onDoubleClick(properties) {
		alert("double click");
	}
	
	function onTreeDoubleClick(properties) {
		constructNetwork(properties.nodes[0]);
	}
	
	function onTreeSelect(properties) {
		if (properties.nodes[0]) {
			constructNetwork(properties.nodes[0]);
		}
	}
	
	function addEdgeToTree(id, childId) {
		treeEdges.add({from: id, to: childId, width: 3});
	}
	
	function addNodesAndEdgesToTree(jsonObject) {
		treeNodes.add({id: jsonObject.id, label: "" + jsonObject.id, childrenActive: false});
		groupsTable.push({id: jsonObject.id, states: jsonObject.states, intensities: jsonObject.intensities});
		
		for (var i = 0; i < jsonObject.children.length; i++) {
			addNodesAndEdgesToTree(jsonObject.children[i]);
			addEdgeToTree(jsonObject.id, jsonObject.children[i].id);
		}
	}
	
	function constructNetwork(clickedId) {
		networkData.nodes.clear();
		networkData.edges.clear();
		
		for (var i = 0; i < groupsTable.length; i++) {
			if (groupsTable[i].id == clickedId) {
				
				// add nodes
				for (var j = 0; j < groupsTable[i].states.length; j++) {
					networkNodes.add({id: j, shape: "dot", value: groupsTable[i].states[j].size, 
										label: "" + groupsTable[i].states[j].size});
				}
				
				//add edges
				for (var x = 0; x < groupsTable[i].intensities.length; x++) {
					for (var y = 0; y < groupsTable[i].intensities[x].length; y++) {
						if (groupsTable[i].intensities[x][y] > 0) {
							networkEdges.add({from: x, to: y, value: groupsTable[i].intensities[x][y],
											label: "" + groupsTable[i].intensities[x][y].toFixed(2)});
						}
					}
				}
			}
		}
	}
	
	function draw(dataJson) {
		var networkNodes = new vis.DataSet();
		var networkEdges = new vis.DataSet();
		
		var networkData= {
			nodes: networkNodes,
			edges: networkEdges
		};
		
		var network = new vis.Network(networkContainer, networkData, networkOptions);
		var tree = new vis.Network(treeContainer, treeData, treeOptions);
		
		tree.on('select', onTreeSelect);
		tree.on('doubleClick', onTreeDoubleClick);
	}
	
	var that = {
		redraw: function () {
			$.ajax({
				url: url,
				data: { },
				success: function (data) {
					draw(data);
				},	
				dataType: 'json',
				error: function (jqXHR, jqXHR, status, err) {
					alert("failed to receive object: " + textStatus + ", " + errorThrown);
				}
			});
		}
	}
	
	return that;
}