//------------------------------------------------------------------------------
// <auto-generated />
//
// This file was automatically generated by SWIG (http://www.swig.org).
// Version 3.0.5
//
// Do not make changes to this file unless you know what you are doing--modify
// the SWIG interface file instead.
//------------------------------------------------------------------------------

namespace TilemapJP {

class ThinPlateSplineConstPINVOKE {

  protected class SWIGExceptionHelper {

    public delegate void ExceptionDelegate(string message);
    public delegate void ExceptionArgumentDelegate(string message, string paramName);

    static ExceptionDelegate applicationDelegate = new ExceptionDelegate(SetPendingApplicationException);
    static ExceptionDelegate arithmeticDelegate = new ExceptionDelegate(SetPendingArithmeticException);
    static ExceptionDelegate divideByZeroDelegate = new ExceptionDelegate(SetPendingDivideByZeroException);
    static ExceptionDelegate indexOutOfRangeDelegate = new ExceptionDelegate(SetPendingIndexOutOfRangeException);
    static ExceptionDelegate invalidCastDelegate = new ExceptionDelegate(SetPendingInvalidCastException);
    static ExceptionDelegate invalidOperationDelegate = new ExceptionDelegate(SetPendingInvalidOperationException);
    static ExceptionDelegate ioDelegate = new ExceptionDelegate(SetPendingIOException);
    static ExceptionDelegate nullReferenceDelegate = new ExceptionDelegate(SetPendingNullReferenceException);
    static ExceptionDelegate outOfMemoryDelegate = new ExceptionDelegate(SetPendingOutOfMemoryException);
    static ExceptionDelegate overflowDelegate = new ExceptionDelegate(SetPendingOverflowException);
    static ExceptionDelegate systemDelegate = new ExceptionDelegate(SetPendingSystemException);

    static ExceptionArgumentDelegate argumentDelegate = new ExceptionArgumentDelegate(SetPendingArgumentException);
    static ExceptionArgumentDelegate argumentNullDelegate = new ExceptionArgumentDelegate(SetPendingArgumentNullException);
    static ExceptionArgumentDelegate argumentOutOfRangeDelegate = new ExceptionArgumentDelegate(SetPendingArgumentOutOfRangeException);

    [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="SWIGRegisterExceptionCallbacks_ThinPlateSplineConst")]
    public static extern void SWIGRegisterExceptionCallbacks_ThinPlateSplineConst(
                                ExceptionDelegate applicationDelegate,
                                ExceptionDelegate arithmeticDelegate,
                                ExceptionDelegate divideByZeroDelegate, 
                                ExceptionDelegate indexOutOfRangeDelegate, 
                                ExceptionDelegate invalidCastDelegate,
                                ExceptionDelegate invalidOperationDelegate,
                                ExceptionDelegate ioDelegate,
                                ExceptionDelegate nullReferenceDelegate,
                                ExceptionDelegate outOfMemoryDelegate, 
                                ExceptionDelegate overflowDelegate, 
                                ExceptionDelegate systemExceptionDelegate);

    [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="SWIGRegisterExceptionArgumentCallbacks_ThinPlateSplineConst")]
    public static extern void SWIGRegisterExceptionCallbacksArgument_ThinPlateSplineConst(
                                ExceptionArgumentDelegate argumentDelegate,
                                ExceptionArgumentDelegate argumentNullDelegate,
                                ExceptionArgumentDelegate argumentOutOfRangeDelegate);

    static void SetPendingApplicationException(string message) {
      SWIGPendingException.Set(new global::System.ApplicationException(message, SWIGPendingException.Retrieve()));
    }
    static void SetPendingArithmeticException(string message) {
      SWIGPendingException.Set(new global::System.ArithmeticException(message, SWIGPendingException.Retrieve()));
    }
    static void SetPendingDivideByZeroException(string message) {
      SWIGPendingException.Set(new global::System.DivideByZeroException(message, SWIGPendingException.Retrieve()));
    }
    static void SetPendingIndexOutOfRangeException(string message) {
      SWIGPendingException.Set(new global::System.IndexOutOfRangeException(message, SWIGPendingException.Retrieve()));
    }
    static void SetPendingInvalidCastException(string message) {
      SWIGPendingException.Set(new global::System.InvalidCastException(message, SWIGPendingException.Retrieve()));
    }
    static void SetPendingInvalidOperationException(string message) {
      SWIGPendingException.Set(new global::System.InvalidOperationException(message, SWIGPendingException.Retrieve()));
    }
    static void SetPendingIOException(string message) {
      SWIGPendingException.Set(new global::System.IO.IOException(message, SWIGPendingException.Retrieve()));
    }
    static void SetPendingNullReferenceException(string message) {
      SWIGPendingException.Set(new global::System.NullReferenceException(message, SWIGPendingException.Retrieve()));
    }
    static void SetPendingOutOfMemoryException(string message) {
      SWIGPendingException.Set(new global::System.OutOfMemoryException(message, SWIGPendingException.Retrieve()));
    }
    static void SetPendingOverflowException(string message) {
      SWIGPendingException.Set(new global::System.OverflowException(message, SWIGPendingException.Retrieve()));
    }
    static void SetPendingSystemException(string message) {
      SWIGPendingException.Set(new global::System.SystemException(message, SWIGPendingException.Retrieve()));
    }

    static void SetPendingArgumentException(string message, string paramName) {
      SWIGPendingException.Set(new global::System.ArgumentException(message, paramName, SWIGPendingException.Retrieve()));
    }
    static void SetPendingArgumentNullException(string message, string paramName) {
      global::System.Exception e = SWIGPendingException.Retrieve();
      if (e != null) message = message + " Inner Exception: " + e.Message;
      SWIGPendingException.Set(new global::System.ArgumentNullException(paramName, message));
    }
    static void SetPendingArgumentOutOfRangeException(string message, string paramName) {
      global::System.Exception e = SWIGPendingException.Retrieve();
      if (e != null) message = message + " Inner Exception: " + e.Message;
      SWIGPendingException.Set(new global::System.ArgumentOutOfRangeException(paramName, message));
    }

    static SWIGExceptionHelper() {
      SWIGRegisterExceptionCallbacks_ThinPlateSplineConst(
                                applicationDelegate,
                                arithmeticDelegate,
                                divideByZeroDelegate,
                                indexOutOfRangeDelegate,
                                invalidCastDelegate,
                                invalidOperationDelegate,
                                ioDelegate,
                                nullReferenceDelegate,
                                outOfMemoryDelegate,
                                overflowDelegate,
                                systemDelegate);

      SWIGRegisterExceptionCallbacksArgument_ThinPlateSplineConst(
                                argumentDelegate,
                                argumentNullDelegate,
                                argumentOutOfRangeDelegate);
    }
  }

  protected static SWIGExceptionHelper swigExceptionHelper = new SWIGExceptionHelper();

  public class SWIGPendingException {
    [global::System.ThreadStatic]
    private static global::System.Exception pendingException = null;
    private static int numExceptionsPending = 0;

    public static bool Pending {
      get {
        bool pending = false;
        if (numExceptionsPending > 0)
          if (pendingException != null)
            pending = true;
        return pending;
      } 
    }

    public static void Set(global::System.Exception e) {
      if (pendingException != null)
        throw new global::System.ApplicationException("FATAL: An earlier pending exception from unmanaged code was missed and thus not thrown (" + pendingException.ToString() + ")", e);
      pendingException = e;
      lock(typeof(ThinPlateSplineConstPINVOKE)) {
        numExceptionsPending++;
      }
    }

    public static global::System.Exception Retrieve() {
      global::System.Exception e = null;
      if (numExceptionsPending > 0) {
        if (pendingException != null) {
          e = pendingException;
          pendingException = null;
          lock(typeof(ThinPlateSplineConstPINVOKE)) {
            numExceptionsPending--;
          }
        }
      }
      return e;
    }
  }


  protected class SWIGStringHelper {

    public delegate string SWIGStringDelegate(string message);
    static SWIGStringDelegate stringDelegate = new SWIGStringDelegate(CreateString);

    [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="SWIGRegisterStringCallback_ThinPlateSplineConst")]
    public static extern void SWIGRegisterStringCallback_ThinPlateSplineConst(SWIGStringDelegate stringDelegate);

    static string CreateString(string cString) {
      return cString;
    }

    static SWIGStringHelper() {
      SWIGRegisterStringCallback_ThinPlateSplineConst(stringDelegate);
    }
  }

  static protected SWIGStringHelper swigStringHelper = new SWIGStringHelper();


  static ThinPlateSplineConstPINVOKE() {
  }


  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_THINPLATE_SPLINE_MAX_VARS_get")]
  public static extern int THINPLATE_SPLINE_MAX_VARS_get();

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_new_ThinPlateSpline__SWIG_0")]
  public static extern global::System.IntPtr new_ThinPlateSpline__SWIG_0(int jarg1);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_new_ThinPlateSpline__SWIG_1")]
  public static extern global::System.IntPtr new_ThinPlateSpline__SWIG_1();

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_delete_ThinPlateSpline")]
  public static extern void delete_ThinPlateSpline(global::System.Runtime.InteropServices.HandleRef jarg1);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_get_nof_points")]
  public static extern int ThinPlateSpline_get_nof_points(global::System.Runtime.InteropServices.HandleRef jarg1);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_get_object_size")]
  public static extern int ThinPlateSpline_get_object_size();

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_set_toler")]
  public static extern void ThinPlateSpline_set_toler(global::System.Runtime.InteropServices.HandleRef jarg1, double jarg2, double jarg3);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_get_toler")]
  public static extern void ThinPlateSpline_get_toler(global::System.Runtime.InteropServices.HandleRef jarg1, global::System.Runtime.InteropServices.HandleRef jarg2, global::System.Runtime.InteropServices.HandleRef jarg3);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_get_interpolation_type")]
  public static extern int ThinPlateSpline_get_interpolation_type(global::System.Runtime.InteropServices.HandleRef jarg1);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_dump_data_points")]
  public static extern void ThinPlateSpline_dump_data_points(global::System.Runtime.InteropServices.HandleRef jarg1);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_delete_list")]
  public static extern int ThinPlateSpline_delete_list(global::System.Runtime.InteropServices.HandleRef jarg1);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_grow_points")]
  public static extern void ThinPlateSpline_grow_points(global::System.Runtime.InteropServices.HandleRef jarg1);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_add_point")]
  public static extern int ThinPlateSpline_add_point(global::System.Runtime.InteropServices.HandleRef jarg1, double jarg2, double jarg3, global::System.Runtime.InteropServices.HandleRef jarg4);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_delete_point")]
  public static extern int ThinPlateSpline_delete_point(global::System.Runtime.InteropServices.HandleRef jarg1, double jarg2, double jarg3);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_get_point")]
  public static extern int ThinPlateSpline_get_point(global::System.Runtime.InteropServices.HandleRef jarg1, double jarg2, double jarg3, global::System.Runtime.InteropServices.HandleRef jarg4);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_get_xy")]
  public static extern bool ThinPlateSpline_get_xy(global::System.Runtime.InteropServices.HandleRef jarg1, int jarg2, global::System.Runtime.InteropServices.HandleRef jarg3, global::System.Runtime.InteropServices.HandleRef jarg4);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_change_point")]
  public static extern bool ThinPlateSpline_change_point(global::System.Runtime.InteropServices.HandleRef jarg1, int jarg2, double jarg3, double jarg4, global::System.Runtime.InteropServices.HandleRef jarg5);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_reset")]
  public static extern void ThinPlateSpline_reset(global::System.Runtime.InteropServices.HandleRef jarg1);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_solve")]
  public static extern int ThinPlateSpline_solve(global::System.Runtime.InteropServices.HandleRef jarg1);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_serialize_size")]
  public static extern int ThinPlateSpline_serialize_size(global::System.Runtime.InteropServices.HandleRef jarg1);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_serialize")]
  public static extern string ThinPlateSpline_serialize(global::System.Runtime.InteropServices.HandleRef jarg1, string jarg2);

  [global::System.Runtime.InteropServices.DllImport("thinplatespline", EntryPoint="CSharp_ThinPlateSpline_deserialize")]
  public static extern string ThinPlateSpline_deserialize(global::System.Runtime.InteropServices.HandleRef jarg1, string jarg2);
}

}