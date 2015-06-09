/******************************************************************************
 * $Id: thinplatespline.h 20193 2010-08-06 17:12:10Z rouault $
 *
 * Project:  GDAL Warp API
 * Purpose:  Declarations for 2D Thin Plate Spline transformer. 
 * Author:   VIZRT Development Team.
 *
 * This code was provided by Gilad Ronnen (gro at visrt dot com) with 
 * permission to reuse under the following license.
 * 
 ******************************************************************************
 * Copyright (c) 2004, VIZRT Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 ****************************************************************************/

#include <stdlib.h>
#include <stdio.h>
#include <math.h>
#include <string.h>
#ifndef MAX
#  define MIN(a,b)      ((a<b) ? a : b)
#  define MAX(a,b)      ((a>b) ? a : b)
#endif

typedef enum
{
	THINPLATE_SPLINE_ZERO_POINTS,
	THINPLATE_SPLINE_ONE_POINT,
	THINPLATE_SPLINE_TWO_POINTS,
	THINPLATE_SPLINE_ONE_DIMENSIONAL,
	THINPLATE_SPLINE_FULL,
	
	THINPLATE_SPLINE_POINT_WAS_ADDED,
	THINPLATE_SPLINE_POINT_WAS_DELETED

} ThinPlateSplineInterType;

//#define THINPLATE_SPLINE_MAX_POINTS 40
#define THINPLATE_SPLINE_MAX_VARS 2

class ThinPlateSpline
{
  public:

    ThinPlateSpline(int nof_vars = 1);
    ~ThinPlateSpline();
    int get_nof_points();
    static int get_object_size();
    void set_toler( double tx, double ty );
    void get_toler( double& tx, double& ty);
    ThinPlateSplineInterType get_interpolation_type ( );

    void dump_data_points();
    int delete_list();

    void grow_points();
    int add_point( const double Px, const double Py, const double *Pvars );
    int delete_point(const double Px, const double Py );
    int get_point( const double Px, const double Py, double *Pvars );
    bool get_xy(int index, double& x, double& y);
    bool change_point(int index, double x, double y, double* Pvars);
    void reset(void);
    int solve(void);

    int serialize_size();
    char* serialize(char* serial);
    char* deserialize(char* serial);

  private:	
    double base_func( const double x1, const double y1,
                      const double x2, const double y2 );

    ThinPlateSplineInterType type;

    int _nof_vars;
    int _nof_points;
    int _max_nof_points;
    int _nof_eqs;

    double _tx, _ty;
    double _ta;
    double _dx, _dy;

    double *x; // [THINPLATE_SPLINE_MAX_POINTS+3];
    double *y; // [THINPLATE_SPLINE_MAX_POINTS+3];

//    double rhs[THINPLATE_SPLINE_MAX_POINTS+3][THINPLATE_SPLINE_MAX_VARS];
//    double coef[THINPLATE_SPLINE_MAX_POINTS+3][THINPLATE_SPLINE_MAX_VARS];
    double *rhs[THINPLATE_SPLINE_MAX_VARS];
    double *coef[THINPLATE_SPLINE_MAX_VARS];

    double *u; // [THINPLATE_SPLINE_MAX_POINTS];
    int *unused; // [THINPLATE_SPLINE_MAX_POINTS];
    int *index; // [THINPLATE_SPLINE_MAX_POINTS];
	
    double *_AA, *_Ainv;
};

