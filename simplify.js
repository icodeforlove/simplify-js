/*
 Copyright (c) 2012, Vladimir Agafonkin
 Simplify.js is a high-performance polyline simplification library
 mourner.github.com/simplify-js
*/
(function (global, undefined) {

	"use strict";


	// to suit your point format, run search/replace for '[0]' and '[1]'
	// to switch to 3D, uncomment the lines in the next 2 functions
	// (configurability would draw significant performance overhead)


	function getSquareDistance(p1, p2) { // square distance between 2 points

		var dx = p1[0] - p2[0],
			//        dz = p1.z - p2.z,
			dy = p1[1] - p2[1];

		return dx * dx +
		//           dz * dz +
		dy * dy;
	}

	function getSquareSegmentDistance(p, p1, p2) { // square distance from a point to a segment

		var x = p1[0],
			y = p1[1],
			dx = p2[0] - x,
			dy = p2[1] - y,
			t;

		if (dx !== 0 || dy !== 0) {

			t = ((p[0] - x) * dx +
			(p[1] - y) * dy) / (dx * dx +
			dy * dy);

			if (t > 1) {
				x = p2[0];
				y = p2[1];
			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
			}
		}

		dx = p[0] - x;
		dy = p[1] - y;

		return dx * dx +
		dy * dy;
	}

	// the rest of the code doesn't care for the point format


	function simplifyRadialDistance(points, sqTolerance) { // distance-based simplification

		var i,
		len = points.length,
			point,
			prevPoint = points[0],
			newPoints = [prevPoint];

		for (i = 1; i < len; i++) {
			point = points[i];

			if (getSquareDistance(point, prevPoint) > sqTolerance) {
				newPoints.push(point);
				prevPoint = point;
			}
		}

		if (prevPoint !== point) {
			newPoints.push(point);
		}

		return newPoints;
	}


	// simplification using optimized Douglas-Peucker algorithm with recursion elimination

	function simplifyDouglasPeucker(points, sqTolerance) {

		var len = points.length,

			MarkerArray = (typeof Uint8Array !== undefined + '') ? Uint8Array : Array,

			markers = new MarkerArray(len),

			first = 0,
			last = len - 1,

			i,
			maxSqDist,
			sqDist,
			index,

			firstStack = [],
			lastStack = [],

			newPoints = [];

		markers[first] = markers[last] = 1;

		while (last) {

			maxSqDist = 0;

			for (i = first + 1; i < last; i++) {
				sqDist = getSquareSegmentDistance(points[i], points[first], points[last]);

				if (sqDist > maxSqDist) {
					index = i;
					maxSqDist = sqDist;
				}
			}

			if (maxSqDist > sqTolerance) {
				markers[index] = 1;

				firstStack.push(first);
				lastStack.push(index);

				firstStack.push(index);
				lastStack.push(last);
			}

			first = firstStack.pop();
			last = lastStack.pop();
		}

		for (i = 0; i < len; i++) {
			if (markers[i]) {
				newPoints.push(points[i]);
			}
		}

		return newPoints;
	}


	var root = (typeof exports !== undefined + '') ? exports : global;


	root.simplify = function (points, tolerance, highestQuality) {

		var sqTolerance = (tolerance !== undefined) ? tolerance * tolerance : 1;

		if (!highestQuality) {
			points = simplifyRadialDistance(points, sqTolerance);
		}
		points = simplifyDouglasPeucker(points, sqTolerance);

		return points;
	};

}(this));