import 'package:flutter/material.dart';

/// Professional Theme Template for Flutter Applications
/// Authored by Dr. Chewa Thassana & Precision Mobile Application Engineering
class AppTheme {
  // Brand Color Palette (Cyber / Scientific / IoT Space)
  static const Color darkBg = Color(0xFF070A12);
  static const Color cardBg = Color(0xFF0E1525);
  static const Color surfaceGlass = Color(0x18121B31);
  static const Color neonCyan = Color(0xFF00F0FF);
  static const Color neonGreen = Color(0xFF00FF88);
  static const Color neonRed = Color(0xFFFF3366);
  static const Color neonYellow = Color(0xFFFFB703);
  static const Color textMain = Color(0xFFF0F4FC);
  static const Color textDim = Color(0xFF7F91B3);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkBg,
      primaryColor: neonCyan,
      colorScheme: const ColorScheme.dark(
        primary: neonCyan,
        secondary: neonGreen,
        error: neonRed,
        surface: cardBg,
      ),
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF0A0F1C),
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: neonCyan),
        titleTextStyle: TextStyle(
          color: textMain,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
        ),
      ),
      cardTheme: CardTheme(
        color: cardBg,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0x3300F0FF), width: 1),
        ),
      ),
    );
  }
}
