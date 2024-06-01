import React, { createContext, useMemo, useCallback, useContext, useRef, useState, forwardRef, useEffect  } from "react"
import PropTypes from "prop-types"
import * as d3Geo from "d3-geo"
import { zoom as d3Zoom, zoomIdentity as d3ZoomIdentity } from "d3-zoom"
import { select as d3Select } from "d3-selection"

const { geoPath, ...projections } = d3Geo

const MapContext = createContext()

const makeProjection = ({
  projectionConfig = {},
  projection = "geoEqualEarth",
  width = 800,
  height = 600,
}) => {
  const isFunc = typeof projection === "function"

  if (isFunc) return projection

  let proj = projections[projection]().translate([width / 2, height / 2])

  const supported = [
    proj.center ? "center" : null,
    proj.rotate ? "rotate" : null,
    proj.scale ? "scale" : null,
    proj.parallels ? "parallels" : null,
  ]

  supported.forEach((d) => {
    if (!d) return
    proj = proj[d](projectionConfig[d] || proj[d]())
  })

  return proj
}

const MapProvider = ({
  width,
  height,
  projection,
  projectionConfig,
  ...restProps
}) => {
  const [cx, cy] = projectionConfig.center || []
  const [rx, ry, rz] = projectionConfig.rotate || []
  const [p1, p2] = projectionConfig.parallels || []
  const s = projectionConfig.scale || null

  const projMemo = useMemo(() => {
    return makeProjection({
      projectionConfig: {
        center: cx || cx === 0 || cy || cy === 0 ? [cx, cy] : null,
        rotate: rx || rx === 0 || ry || ry === 0 ? [rx, ry, rz] : null,
        parallels: p1 || p1 === 0 || p2 || p2 === 0 ? [p1, p2] : null,
        scale: s,
      },
      projection,
      width,
      height,
    })
  }, [width, height, projection, cx, cy, rx, ry, rz, p1, p2, s])

  const proj = useCallback(projMemo, [projMemo])

  const value = useMemo(() => {
    return {
      width,
      height,
      projection: proj,
      path: geoPath().projection(proj),
    }
  }, [width, height, proj])

  return <MapContext.Provider value={value} {...restProps} />
}

MapProvider.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  projection: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  projectionConfig: PropTypes.object,
}

const useMapContext = () => {
  return useContext(MapContext)
}

export { MapProvider, MapContext, useMapContext }







function useZoomPan({
  scaleExtent = [1, 8], // Example scale extent for zooming
  translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]], // Example translate extent for panning
}) {
  const { width, height } = useContext(MapContext);
  const mapRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startPointRef = useRef({ x: 0, y: 0 });
  const startPositionRef = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0, k: 1 });
  const delta = 50; // Sensitivity threshold to start dragging

  useEffect(() => {
    const svg = d3Select(mapRef.current);
    const zoomBehavior = d3Zoom()
      .scaleExtent(scaleExtent)
      .translateExtent(translateExtent)
      .on("zoom", (event) => {
        setPosition({
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k
        });
      });

    svg.call(zoomBehavior);

    const handleMouseMove = (event) => {
      const currentPoint = { x: event.clientX, y: event.clientY };
      const diffX = currentPoint.x - startPointRef.current.x;
      const diffY = currentPoint.y - startPointRef.current.y;

      // Check if movement exceeds the sensitivity threshold before considering it dragging
      if (Math.abs(diffX) > delta || Math.abs(diffY) > delta) {
        if (!isDraggingRef.current) {
          // Mark as dragging only after moving beyond the threshold
          isDraggingRef.current = true;
          console.log('Start dragging'); // Optionally log the start of a drag
          const newX = startPositionRef.current.x + diffX;
          const newY = startPositionRef.current.y + diffY;
          svg.call(zoomBehavior.transform, d3ZoomIdentity.translate(newX, newY).scale(position.k));
        }
        // Optionally continue logging the movement or handle panning here
        console.log('Dragging movement:', diffX, diffY);
      }
    };

    const handleMouseDown = (event) => {
      startPointRef.current = { x: event.clientX, y: event.clientY };
      startPositionRef.current = { x: position.x, y: position.y };
      // Attach the mousemove listener to start tracking movement
      document.addEventListener('mousemove', handleMouseMove);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        console.log('Stop dragging'); // Optionally log the end of a drag
        isDraggingRef.current = false; // Reset dragging state
      }
      document.removeEventListener('mousemove', handleMouseMove); // Stop tracking movement
    };

    svg.on("mousedown.zoom", handleMouseDown);
    //document.addEventListener('mousedown.zoom', handleMouseDown);
    svg.on("mouseup.zoom", handleMouseUp);
    //document.addEventListener('mouseup', handleMouseUp);

    return () => {
      //svg.on("mousedown.zoom", null); // Cleanup mousedown listener
      document.removeEventListener('mouseup', handleMouseUp); // Cleanup mouseup listener
      document.removeEventListener('mousemove', handleMouseMove); // Ensure mousemove listener is removed
    };
  }, [scaleExtent, translateExtent, position.x, position.y, position.k]); // React to changes in these dependencies

  return {
    mapRef,
    position,
    transformString: `translate(${position.x},${position.y}) scale(${position.k})`,
  };
}









const ZoomPanContext = createContext()

const defaultValue = {
  x: 0,
  y: 0,
  k: 1,
  transformString: "translate(0 0) scale(1)",
}

const ZoomPanProvider = ({ value = defaultValue, ...restProps }) => {
  return <ZoomPanContext.Provider value={value} {...restProps} />
}

ZoomPanProvider.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  k: PropTypes.number,
  transformString: PropTypes.string,
}

const useZoomPanContext = () => {
  return useContext(ZoomPanContext)
}

export { ZoomPanContext, ZoomPanProvider, useZoomPanContext }

const CustomZoomableGroup = forwardRef(
    (
      {
        center = [0, 0],
        zoom = 1,
        minZoom = 1,
        maxZoom = 8,
        translateExtent,
        filterZoomEvent,
        onMoveStart,
        onMove,
        onMoveEnd,
        className,
        ...restProps
      },
      ref
    ) => {
      const { width, height } = useContext(MapContext)
  
      const { mapRef, transformString, position } = useZoomPan({
        center,
        filterZoomEvent,
        onMoveStart,
        onMove,
        onMoveEnd,
        scaleExtent: [minZoom, maxZoom],
        translateExtent,
        zoom,
      })
  
      return (
        <ZoomPanProvider
          value={{ x: position.x, y: position.y, k: position.k, transformString }}
        >
          <g ref={mapRef}>
            <rect width={width} height={height} fill="transparent" />
            <g
              ref={ref}
              transform={transformString}
              className={`rsm-zoomable-group ${className}`}
              {...restProps}
            />
          </g>
        </ZoomPanProvider>
      )
    }
  )
  
  CustomZoomableGroup.displayName = "ZoomableGroup"
  
  CustomZoomableGroup.propTypes = {
    center: PropTypes.array,
    zoom: PropTypes.number,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    translateExtent: PropTypes.arrayOf(PropTypes.array),
    onMoveStart: PropTypes.func,
    onMove: PropTypes.func,
    onMoveEnd: PropTypes.func,
    className: PropTypes.string,
  }
  
  export default CustomZoomableGroup