using System;
using ObjCRuntime;

[assembly: LinkWith ("libthinplatespline.a", LinkTarget.Simulator | LinkTarget.ArmV7 | LinkTarget.ArmV7s | LinkTarget.Arm64, SmartLink = true, ForceLoad = true)]
