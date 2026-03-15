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
        // Generate nodes and links from resources
        const nodes: any[] = [
            { id: 'nexus-core', name: 'NEXUS CENTRAL AI', group: 'core', val: 25, color: '#8b5cf6' } // Neon Purple Core
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

    useEffect(() => {
        // Auto-rotate camera slowly to give a highly active, matrix-like feel
        let angle = 0;
        let animationFrameId: number;

        const rotateCamera = () => {
            if (fgRef.current) {
                // Ensure we don't override manual zooms significantly by keeping radius dynamic or large
                const distance = 250;
                fgRef.current.cameraPosition({
                    x: distance * Math.sin(angle),
                    z: distance * Math.cos(angle)
                });
                angle += Math.PI / 1000;
            }
            animationFrameId = requestAnimationFrame(rotateCamera);
        };

        // Slight delay to let graph initialize
        const timeoutId = setTimeout(() => { rotateCamera(); }, 2000);

        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

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
                        // Make core glowing
                        const geometry = new THREE.SphereGeometry(node.val, 32, 32);
                        const material = new THREE.MeshPhongMaterial({ color: node.color, transparent: true, opacity: 0.9, emissive: node.color, emissiveIntensity: 0.5 });
                        const sphere = new THREE.Mesh(geometry, material);
                        group.add(sphere);

                        // Make core text stand out
                        const sprite = new SpriteText("★ " + node.name + " ★");
                        sprite.color = '#e2e8f0'; // bright white/slate
                        sprite.fontWeight = 'bold';
                        sprite.textHeight = 10;
                        sprite.position.y = 35;
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
                height={400}
            />
        </div>
    );
};

export default TopologyMap;
