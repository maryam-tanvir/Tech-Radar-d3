import React, { useContext, useState, useEffect } from 'react';
import { RadarContents } from "./Radar.style";
import PropTypes from 'prop-types';
import Quadrant from "../Quadrant/Quadrant";
import { getColorScale, ThemeContext } from "../theme-context";

const MAX_COLLISION_RETRY_COUNT = 350;
const TOLERANCE_CONSTANT = 6;
const DEFAULT_WIDTH = 700;
const RADIUS_DIMINISH_CONSTANT = 1.5;
const RIGHT_EXTENSION = 1.1;

function RadarTimer(props) {
    const width = props.width || DEFAULT_WIDTH;
    const rings = props.rings || [""];
    const radiusDiminishConstant = props.radiusDiminish || RADIUS_DIMINISH_CONSTANT;
    const [data, setData] = useState(props.data || []);

    const { fontSize, fontFamily, colorScale } = useContext(ThemeContext);
    const margin = props.margin || 5;
    const angle = 360 / props.quadrants.length;
    const toleranceX = width / rings.length / 100 * TOLERANCE_CONSTANT * 4;
    const toleranceY = (props.fontSize || fontSize);

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        setData(props.data || []);
    }, [props.data]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/data');
                const contentType = response.headers.get("content-type");

                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }

                if (contentType && contentType.includes("application/json")) {
                    const result = await response.json();
                    setData(result);
                } else {
                    const text = await response.text();
                    throw new Error(`Expected JSON, but got: ${text}`);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();

        const interval = setInterval(() => {
            fetchData();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const refreshData = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    const processRadarData = (quadrants, rings, data) => {
        if (!Array.isArray(data)) {
            console.error("Data is not an array");
            return [];
        }

        data.sort((a, b) => rings.indexOf(a.ring) - rings.indexOf(b.ring));

        let collisionCount = 0;
        const results = [];

        for (const i in data) {
            const entry = data[i];
            let quadrant_delta = 0;

            const angle = 2 * Math.PI / props.quadrants.length;
            for (let j = 0, len = quadrants.length; j < len; j++) {
                if (quadrants[j] === entry.quadrant) {
                    quadrant_delta = angle * j;
                }
            }
            const coordinates = getRandomCoordinates(rings, entry, angle, quadrant_delta, results, collisionCount);
            if (collisionCount < MAX_COLLISION_RETRY_COUNT) {
                collisionCount = coordinates.collisionCount;
            }

            const blip = {
                id: i,
                name: entry.name,
                quadrant: entry.quadrant,
                x: coordinates.x,
                y: coordinates.y
            };

            results.push(blip);
        }

        return results;
    };

    const getRandomCoordinates = (rings, entry, angle, quadrant_delta, results, collisionCount = 0) => {
        const polarToCartesian = (r, t) => {
            const x = r * Math.cos(t);
            const y = r * Math.sin(t);
            return { x: x, y: y };
        };

        const getPositionByQuadrant = (radiusArray) => {
            const ringCount = rings.length;
            const margin = 0.2;
            const ringIndex = rings.indexOf(entry.ring);
            const posStart = radiusArray[ringIndex] + (1 / ringCount * margin);
            const posLength = Math.random() * ((radiusArray[ringIndex + 1] - radiusArray[ringIndex]) - (2 * (1 / ringCount * margin)));
            return posStart + posLength;
        };

        const calculateRadiusDiminish = (nrOfRings) => {
            let max = 1;
            let arr = [1];
            for (let i = 1; i < nrOfRings; i++) {
                max = max * radiusDiminishConstant;
                arr.push(max);
            }

            const sum = arr.reduce((a, b) => a + b);
            arr = arr.map((a) => a / sum);

            arr.reverse();
            for (let i = 1; i < nrOfRings; i++) {
                arr[i] = arr[i - 1] + arr[i];
            }

            arr.push(0);
            arr.sort();

            return arr;
        };

        const hasCollision = (results, coordinates) => {
            if (collisionCount >= MAX_COLLISION_RETRY_COUNT) {
                return false;
            }

            for (const result of results) {
                const deltaX = Math.abs(coordinates.x - result.x);
                const deltaY = Math.abs(coordinates.y - result.y);
                if (deltaX < toleranceX && deltaY < toleranceY) {
                    return true;
                }
            }

            return false;
        };

        const radiusArray = calculateRadiusDiminish(rings.length);

        const r = getPositionByQuadrant(radiusArray);
        const t = quadrant_delta + (Math.random() * angle);
        const coordinates = polarToCartesian(r, t);

        if (hasCollision(results, coordinates)) {
            collisionCount++;
            return getRandomCoordinates(rings, entry, angle, quadrant_delta, results, collisionCount);
        }

        return { x: coordinates.x, y: coordinates.y, collisionCount: collisionCount };
    };

    const processedData = processRadarData(props.quadrants, props.rings, data);

    return (
        <RadarContents width={width} height={width * RIGHT_EXTENSION} key={refreshKey}>
            {props.quadrants.map((quadrant, index) => {
                return (
                    <Quadrant
                        key={index}
                        transform={`rotate(${index * angle})`}
                        rotateDegrees={index * angle}
                        width={width}
                        index={index}
                        rings={rings}
                        points={processedData.filter(value => value.quadrant === quadrant)}
                        angle={angle}
                        name={quadrant}
                        radiusDiminish={radiusDiminishConstant}
                    />
                )
            })}
        </RadarContents>
    )
}

RadarTimer.propTypes = {
    width: PropTypes.number,
    quadrants: PropTypes.array.isRequired,
    rings: PropTypes.array.isRequired,
    data: PropTypes.array,
    margin: PropTypes.number,
    radiusDiminish: PropTypes.number,
    fontSize: PropTypes.number
};

export default RadarTimer;
