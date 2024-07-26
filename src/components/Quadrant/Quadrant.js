import React, { useContext } from 'react';
import Text from "../Text/Text";
import Path from "../Path/Path";
import Line from "../Line/Line";
import Item from "../Item/Item";
import { QuadrantWrapper } from "./Quadrant.style";
import { ThemeContext } from "../theme-context";
import PropTypes from "prop-types";

function Quadrant(props) {
  const { fontSize, fontFamily, colorScale, quadrantsConfig: { textMargin, textYOffset, showOnlyFirstQuadrantLabels } } = useContext(ThemeContext);

  const radiusDiminishConstant = props.radiusDiminish;

  const ringWidth = props.width / 2;
  const radialAngle = 2 * Math.PI / 360 * props.angle;

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

  const radiuses = calculateRadiusDiminish(props.rings.length);

  return (
    <QuadrantWrapper transform={props.transform}>
      <Line
        x2={ringWidth}
        y2={0}
        stroke={colorScale(props.index)}
      />

      {props.rings.map((ringValue, ringIndex) => {
        const ringsLength = props.rings.length;
        const title = ringIndex === props.rings.length - 1 ? props.name : null;

        const leftMargin = textMargin ?? (40 * (radiuses[ringIndex + 1] - radiuses[ringIndex]));
        const showLabel = showOnlyFirstQuadrantLabels ? props.index === 0 : true;
        return (
          <g key={props.index + "-" + ringIndex}>
            {showLabel && <Text
              name={ringValue}
              dx={leftMargin + (radiuses[ringIndex] * ringWidth)}
              dy={textYOffset}
              fontSize={fontSize}
              fontFamily={fontFamily}
            />}
            <Path
              quadIndex={props.index}
              ringIndex={ringIndex}
              ringWidth={ringWidth}
              ringsLength={ringsLength}
              quad_angle={radialAngle}
              outerRadius={radiuses[ringIndex + 1]}
              innerRadius={radiuses[ringIndex]}
              title={title}
            />
          </g>
        )
      })}
      {props.points.map((value, index) => {
        return (
          <Item
            rotateDegrees={-props.rotateDegrees}
            key={index}
            data={value} />
        )
      }
      )}
    </QuadrantWrapper>
  )
}

Quadrant.propTypes = {
  transform: PropTypes.string.isRequired,
  rotateDegrees: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  rings: PropTypes.array.isRequired,
  points: PropTypes.array.isRequired,
  angle: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  radiusDiminish: PropTypes.number
};

export default Quadrant;
