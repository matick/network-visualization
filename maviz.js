var MAViz = function (opts) {
	var url = opts.url;
	var networkContainer = document.getElementById(opts.networkContainer);
	var treeContainer = document.getElementById(opts.treeContainer);
	
	var treeNodes = new vis.DataSet();
	var treeEdges = new vis.DataSet();
	var networkNodes = new vis.DataSet();
	var networkEdges = new vis.DataSet();
	
	var treeData = {
		nodes: treeNodes,
		edges: treeEdges
	};
	
	var networkData= {
		nodes: networkNodes,
		edges: networkEdges
	};
	
	var groupsTable = [];
	
	var networkOptions = {
		edges: {
			style: "arrow",
			arrowScaleFactor: 0.4,
			widthMax: 6
		},
		nodes: {
			fontSize: 20
		},
		physics: {
			barnesHut: {
				springLength: 150
			}
		}
	};
	
	var treeOptions = {
		hierarchicalLayout: {
			layout: "direction"
		},
		edges: {
			style: "arrow",
			arrowScaleFactor: 0.4
		},
		nodes: {
			color: {
				background: "#97C2FC",
				highlight: {
					background: "#00FF00"
				}
			}
		}
	};
	
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
					networkNodes.add({id: groupsTable[i].states[j].id, shape: "dot", value: groupsTable[i].states[j].size, 
										label: "" + groupsTable[i].states[j].id});
				}
				
				//add edges
				for (var x = 0; x < groupsTable[i].intensities.length; x++) {
					for (var y = 0; y < groupsTable[i].intensities[x].length; y++) {
						if (groupsTable[i].intensities[x][y] > 0) {
							var a = groupsTable[i].states[x].id;
							var b = groupsTable[i].states[y].id;
							networkEdges.add({from: a, to: b, value: groupsTable[i].intensities[x][y],
											label: "" + groupsTable[i].intensities[x][y].toFixed(2)});
						}
					}
				}
			}
		}
	}
	
	function draw(dataJson) {
		treeNodes = new vis.DataSet();
		treeEdges = new vis.DataSet();
		networkNodes = new vis.DataSet();
		networkEdges = new vis.DataSet();
		
		addNodesAndEdgesToTree(dataJson);
		
		treeData = {
			nodes: treeNodes,
			edges: treeEdges
		};
		
		networkData= {
			nodes: networkNodes,
			edges: networkEdges
		};
		
		var network = new vis.Network(networkContainer, networkData, networkOptions);
		var tree = new vis.Network(treeContainer, treeData, treeOptions);
		
		tree.on('select', onTreeSelect);
		tree.on('doubleClick', onTreeDoubleClick);
	}
	
	var that = {
		refresh: function () {
			$.ajax({
				url: url,
				data: { },
				success: function (data) {
					draw(data);
				},	
				dataType: 'json',
				error: function (jqXHR, jqXHR, status, err) {
					alert("failed to receive object: " + status + ", " + err);
				}
			});
		}
	}
	
	return that;
}