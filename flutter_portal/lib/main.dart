import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_animate/flutter_animate.dart';

void main() {
  runApp(const SymposiumApp());
}

class SymposiumApp extends StatelessWidget {
  const SymposiumApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Technical Symposium Portal',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B0F19),
        primaryColor: const Color(0xFF3B82F6),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
        useMaterial3: true,
      ),
      home: const ReviewerDashboard(),
    );
  }
}

class ReviewerDashboard extends StatefulWidget {
  const ReviewerDashboard({super.key});

  @override
  State<ReviewerDashboard> createState() => _ReviewerDashboardState();
}

class _ReviewerDashboardState extends State<ReviewerDashboard> {
  List teams = [];
  bool isLoading = true;
  final String baseUrl = 'http://127.0.0.1:5000/api'; // Update to your local IP for mobile testing

  @override
  void initState() {
    super.initState();
    fetchTeams();
  }

  Future<void> fetchTeams() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/reviewer/teams'));
      if (response.statusCode == 200) {
        setState(() {
          teams = json.decode(response.body);
          isLoading = false;
        });
      }
    } catch (e) {
      print('Error: $e');
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Flutter Background Gradient (Better Experience)
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
            ),
          ).animate(onPlay: (controller) => controller.repeat(reverse: true)).blur(begin: Offset(100, 100), end: Offset(150, 150), duration: 2.seconds),
          
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'REVIEWER',
                            style: GoogleFonts.inter(
                              color: Colors.blue,
                              fontSize: 10,
                              fontWeight: FontWeight.black,
                              letterSpacing: 4,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Mobile Dashboard',
                            style: GoogleFonts.inter(
                              fontSize: 28,
                              fontWeight: FontWeight.black,
                              letterSpacing: -1,
                            ),
                          ),
                        ],
                      ).animate().fadeIn(duration: 600.ms).slideX(begin: -0.2),
                      
                      const CircleAvatar(
                        backgroundColor: Color(0xFF151C2C),
                        child: Icon(Icons.person, color: Colors.blue),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 40),
                  
                  Text(
                    'ASSIGNED TEAMS',
                    style: GoogleFonts.inter(
                      color: Colors.white24,
                      fontSize: 10,
                      fontWeight: FontWeight.black,
                      letterSpacing: 2,
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  Expanded(
                    child: isLoading 
                      ? const Center(child: CircularProgressIndicator())
                      : ListView.builder(
                          itemCount: teams.length,
                          itemBuilder: (context, index) {
                            final team = teams[index];
                            return Container(
                              margin: const EdgeInsets.only(bottom: 16),
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: const Color(0xFF151C2C),
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: Colors.white.withOpacity(0.05)),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 48,
                                    height: 48,
                                    decoration: BoxDecoration(
                                      color: Colors.blue.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: const Icon(Icons.groups, color: Colors.blue),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          team['teamName'] ?? 'No Name',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
                                        ),
                                        Text(
                                          team['teamId'] ?? 'ID: Unknown',
                                          style: const TextStyle(
                                            color: Colors.white38,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const Icon(Icons.chevron_right, color: Colors.white24),
                                ],
                              ),
                            ).animate().fadeIn(delay: (index * 100).ms, duration: 400.ms).slideY(begin: 0.2);
                          },
                        ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        color: const Color(0xFF0B0F19),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: const [
            Icon(Icons.dashboard, color: Colors.blue),
            Icon(Icons.history, color: Colors.white24),
            Icon(Icons.settings, color: Colors.white24),
          ],
        ),
      ),
    );
  }
}
