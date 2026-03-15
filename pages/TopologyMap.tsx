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
    const linksRef = useRef<any[]>([]);
    const nodesRef = useRef<any[]>([]);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });

    useEffect(() => {
        let coreNode = nodesRef.current.find((n: any) => n.id === 'nexus-core');
        if (!coreNode) {
            coreNode = { id: 'nexus-core', name: 'NEXUS CENTRAL AI', group: 'core', val: 35, color: '#a855f7' };
        }
        const nodes: any[] = [coreNode];
        const links: any[] = [];

        resources.forEach(res => {
            let color = '#14b8a6'; // teal
            if (res.status === 'CRITICAL' || res.currentLoad > 80) color = '#f43f5e'; // rose
            else if (res.status === 'HIGH_LOAD' || res.currentLoad > 60) color = '#f59e0b'; // amber

            // Determine size by capacity or type
            let val = 18;
            if (res.type === 'GPU') val = 25;

            let node = nodesRef.current.find((n: any) => n.id === res.id);
            if (node) {
                node.color = color;
                node.val = val;
                node.load = res.currentLoad;
            } else {
                node = {
                    id: res.id,
                    name: res.name,
                    group: res.type,
                    val: val,
                    color: color,
                    load: res.currentLoad
                };
            }
            nodes.push(node);

            // REUSE link objects to prevent the physics engine from violently shaking!
            let link = linksRef.current.find((l: any) => (l.source.id || l.source) === res.id);
            if (link) {
                // Mutate to update styles without recreating the physics spring
                link.color = color;
                link.width = res.currentLoad > 80 ? 3 : 1;
            } else {
                link = {
                    source: res.id,
                    target: 'nexus-core',
                    color: color,
                    width: res.currentLoad > 80 ? 3 : 1
                };
            }
            links.push(link);
        });

        nodesRef.current = nodes;
        linksRef.current = links;
        setGraphData({ nodes, links });
    }, [resources]);

    useEffect(() => {
        if (!fgRef.current) return;

        // Push nodes further apart so they aren't clumped together
        fgRef.current.d3Force('charge').strength(-800);
        fgRef.current.d3Force('link').distance(120);

        // Set an initial cinematic camera position, but do NOT auto-rotate
        // so the user has full control.
        const timeoutId = setTimeout(() => {
            if (fgRef.current) {
                fgRef.current.cameraPosition(
                    { x: 0, y: 80, z: 350 }, // Position the camera slightly up and back
                    { x: 0, y: 0, z: 0 },    // Look at the center
                    2000                     // Smooth transition
                );
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div className="w-full h-[600px] bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl relative">
            <div className="absolute top-6 left-8 z-10">
                <h3 className="text-teal-400 font-black text-lg tracking-[0.3em] uppercase flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse shadow-[0_0_15px_rgba(45,212,191,0.8)]"></span>
                    Live Matrix Topology
                </h3>
            </div>
            <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                backgroundColor="#0b0f19"
                nodeThreeObject={(node: any) => {
                    if (node.id === 'nexus-core') {
                        const group = new THREE.Group();

                        // Glowing Sphere Core
                        const geometry = new THREE.SphereGeometry(node.val, 32, 32);
                        const material = new THREE.MeshPhysicalMaterial({
                            color: node.color,
                            transparent: true,
                            opacity: 0.8,
                            emissive: node.color,
                            emissiveIntensity: 0.8,
                            roughness: 0.2,
                            metalness: 0.8
                        });
                        const sphere = new THREE.Mesh(geometry, material);
                        group.add(sphere);

                        // Outer Holographic Ring
                        const ringGeo = new THREE.TorusGeometry(node.val * 1.5, 0.5, 16, 100);
                        const ringMat = new THREE.MeshBasicMaterial({ color: '#c084fc', transparent: true, opacity: 0.5 });
                        const ring = new THREE.Mesh(ringGeo, ringMat);
                        ring.rotation.x = Math.PI / 2;
                        group.add(ring);

                        // Floating Text
                        const sprite = new SpriteText("★ " + node.name + " ★");
                        sprite.color = '#ffffff';
                        sprite.fontWeight = 'bold';
                        sprite.textHeight = 12;
                        sprite.position.y = 45;
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
                    // Use bright white text with a black outline so it can be read from far away regardless of the node color
                    sprite.color = '#ffffff';
                    sprite.fontWeight = 'bold';
                    sprite.strokeWidth = 1;
                    sprite.strokeColor = '#000000';
                    sprite.textHeight = 6;
                    sprite.position.y = Math.max(20, node.val + 10);
                    group.add(sprite);

                    return group;
                }}
                linkWidth={link => link.width}
                linkColor={link => link.color}
                linkDirectionalParticles={link => (link.width === 3 ? 6 : 3)}
                linkDirectionalParticleSpeed={link => link.width * 0.008}
                linkDirectionalParticleWidth={3}
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
                height={600}
            />
        </div>
    );
};

export default TopologyMap;
