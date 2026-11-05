# ProGuard rules for Kajol Bengali Voice Assistant

# Preserve Hilt
-keep class * extends dagger.hilt.internal.GeneratedComponent { *; }
-keep class * implements dagger.hilt.internal.GeneratedComponent { *; }

# Preserve Google Generative AI
-keep class com.google.ai.client.generativeai.** { *; }

# Keep model data classes
-keep class com.kajol.assistant.data.model.** { *; }

# Keep SpeechRecognizer and TTS callbacks
-keepclassmembers class * {
    void onResults(android.os.Bundle);
    void onPartialResults(android.os.Bundle);
    void onError(int);
}

# AndroidX DataStore & Security
-keep class androidx.datastore.preferences.** { *; }
-keep class androidx.security.crypto.** { *; }
