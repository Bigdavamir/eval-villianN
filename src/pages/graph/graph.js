document.addEventListener('DOMContentLoaded', () => {
    const graphContainer = document.getElementById('graph-container');
    const refreshBtn = document.getElementById('refresh-btn');

    const EV_TIMELINE_KEY = 'evalvillain_timeline';

    function renderGraph(events) {
        if (!events || events.length === 0) {
            graphContainer.innerHTML = '<p style="color: #d4d4d4; padding: 20px;">No events recorded yet. Interact with a page to generate graph data.</p>';
            return;
        }

        const nodeMap = new Map();
        const nodes = new vis.DataSet();
        const edges = new vis.DataSet();
        let nodeIdCounter = 0;

        // First pass: create unique nodes for all sources and sinks
        events.forEach(event => {
            let key;
            if (event.type === 'source') {
                key = `source|${event.sourceValue}|${event.timestamp}`;
            } else {
                key = `sink|${event.sinkName}|${event.timestamp}`;
            }

            if (!nodeMap.has(key)) {
                const nodeId = `graph-node-${nodeIdCounter++}`;
                nodeMap.set(key, nodeId);

                if (event.type === 'source') {
                    nodes.add({
                        id: nodeId,
                        label: `${event.sourceType}\n(${event.sourceValue.substring(0, 30)}${event.sourceValue.length > 30 ? '...' : ''})`,
                        title: `<b>Source Type:</b> ${event.sourceType}<br><b>Value:</b> ${escape(event.sourceValue)}<br><b>Origin:</b> ${event.origin}`,
                        color: '#4EC9B0',
                        shape: 'ellipse'
                    });
                } else {
                    nodes.add({
                        id: nodeId,
                        label: event.sinkName,
                        title: `<b>Sink:</b> ${event.sinkName}<br><b>Origin:</b> ${event.origin}`,
                        color: '#F44747',
                        shape: 'box'
                    });
                }
            }
        });

        // Second pass: create edges
        events.forEach(event => {
            if (event.type === 'sink' && event.sources) {
                const sinkKey = `sink|${event.sinkName}|${event.timestamp}`;
                const sinkId = nodeMap.get(sinkKey);

                event.sources.forEach(sourceInSink => {
                    const sourceKey = `source|${sourceInSink.sourceValue}|${sourceInSink.sourceTimestamp}`;
                    const sourceId = nodeMap.get(sourceKey);

                    if (sourceId && sinkId) {
                        edges.add({
                            from: sourceId,
                            to: sinkId
                        });
                    }
                });
            }
        });

        const data = {
            nodes: nodes,
            edges: edges,
        };

        const options = {
            layout: {
                improvedLayout: true,
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
            },
            physics: {
                enabled: true,
                barnesHut: {
                    gravitationalConstant: -15000,
                    centralGravity: 0.3,
                    springLength: 120,
                    springConstant: 0.04,
                    damping: 0.09,
                    avoidOverlap: 0.1
                },
                stabilization: {
                    iterations: 200,
                },
            },
            nodes: {
                shape: 'box',
                font: {
                    color: '#d4d4d4'
                }
            },
            edges: {
                arrows: 'to',
                color: {
                    color: '#848484',
                    highlight: '#848484',
                    hover: '#848484'
                }
            },
            physics: {
                enabled: true
            }
        };

        new vis.Network(graphContainer, data, options);
    }

    function loadData() {
        browser.storage.local.get(EV_TIMELINE_KEY, (result) => {
            renderGraph(result[EV_TIMELINE_KEY]);
        });
    }

    refreshBtn.addEventListener('click', loadData);

    // Initial load
    loadData();
});
