package com.kajol.assistant.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class KajolAccessibilityService : AccessibilityService() {

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Track active window or current app context if needed
    }

    override fun onInterrupt() {}

    fun performSystemBack(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_BACK)
    }

    fun performSystemHome(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_HOME)
    }

    fun performSystemRecents(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_RECENTS)
    }

    fun performOpenNotifications(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS)
    }

    fun clickElementWithText(text: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val nodes = rootNode.findAccessibilityNodeInfosByText(text)
        if (!nodes.isNullOrEmpty()) {
            for (node in nodes) {
                if (node.isClickable) {
                    return node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                }
                var parent = node.parent
                while (parent != null) {
                    if (parent.isClickable) {
                        return parent.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                    }
                    parent = parent.parent
                }
            }
        }
        return false
    }

    override fun onDestroy() {
        super.onDestroy()
        if (instance == this) {
            instance = null
        }
    }

    companion object {
        var instance: KajolAccessibilityService? = null
            private set
    }
}
