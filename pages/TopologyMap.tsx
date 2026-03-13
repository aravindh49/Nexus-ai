import React, { useState, useEffect, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import { Resource } from '../types';

interface TopologyProps {
    resources: Resource[];
}

const TopologyMap: React.FC<TopologyProps> = ({ resources }) => {
    const fgRef = useRef<any>();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });

    useEffect(() => {
        // Generate nodes and links from resources
        const nodes: any[] = [
            { id: 'nexus-core', name: 'Nexus Core', group: 'core', val: 20, color: '#0ea5e9' } // Central Node
        ];
        const links: any[] = [];

        resources.forEach(res => {
            let color = '#14b8a6'; // teal
            if (res.status === 'CRITICAL' || res.currentLoad > 80) color = '#f43f5e'; // rose
            else if (res.status === 'HIGH_LOAD' || res.currentLoad > 60) color = '#f59e0b'; // amber

            // Determine size by capacity or type
            let val = 10;
            if (res.type === 'GPU') val = 15;

            nodes.push({
                id: res.id,
                name: res.name,
                group: res.type,
                val: val,
                color: color,
                load: res.currentLoad
            });

            // Link everything to core to show topology
            links.push({
                source: res.id,
                target: 'nexus-core',
                color: color,
                width: res.currentLoad > 80 ? 3 : 1
            });
        });

        setGraphData({ nodes, links });
    }, [resources]);

    return (
        <div className="w-full h-[400px] bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl relative">
            <div className="absolute top-4 left-6 z-10">
                <h3 className="text-teal-400 font-bold text-sm tracking-[0.2em] uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                    Live Matrix Topology
                </h3>
            </div>
            <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                backgroundColor="#0f172a"
                nodeThreeObject={(node: any) => {
                    if (node.id === 'nexus-core') {
                        const group = new THREE.Group();
                        const geometry = new THREE.SphereGeometry(node.val, 32, 32);
                        const material = new THREE.MeshPhongMaterial({ color: node.color, transparent: true, opacity: 0.8 });
                        const sphere = new THREE.Mesh(geometry, material);
                        group.add(sphere);

                        const sprite = new SpriteText(node.name);
                        sprite.color = '#ffffff';
                        sprite.textHeight = 8;
                        sprite.position.y = 25;
                        group.add(sprite);
                        return group;
                    }

                    const group = new THREE.Group();
                    // Resource Node
                    const geometry = new THREE.DodecahedronGeometry(node.val);
                    const material = new THREE.MeshPhongMaterial({
                        color: node.color,
                        transparent: true,
                        opacity: 0.9,
                        wireframe: node.load > 80
                    });
                    const mesh = new THREE.Mesh(geometry, material);
                    group.add(mesh);

                    const sprite = new SpriteText(`${node.name}\n[${node.load}%]`);
                    sprite.color = node.color;
                    sprite.textHeight = 4;
                    sprite.position.y = 15;
                    group.add(sprite);

                    return group;
                }}
                linkWidth={link => link.width}
                linkColor={link => link.color}
                linkDirectionalParticles={link => (link.width === 3 ? 4 : 2)}
                linkDirectionalParticleSpeed={link => link.width * 0.005}
                linkDirectionalParticleWidth={2}
                enableNodeDrag={true}
                onNodeClick={node => {
                    // Aim at node from outside it
                    const distance = 100;
                    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
                    fgRef.current?.cameraPosition(
                        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
                        node, // lookAt ({ x, y, z })
                        3000  // ms transition duration
                    );
                }}
                height={400}
            />
        </div>
    );
};

export default TopologyMap;
