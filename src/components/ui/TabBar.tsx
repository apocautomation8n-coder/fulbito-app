import React from 'react';
import { StyleSheet, Text, View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { Pressable } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme/designSystem';

type TabItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type TabBarProps = ViewProps & {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  style?: StyleProp<ViewStyle>;
};

export function TabBar({ tabs, activeTab, onTabChange, style, ...props }: TabBarProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <Pressable
            key={tab.id}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.activeTab,
              pressed && styles.pressed,
            ]}
            onPress={() => onTabChange(tab.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <View style={[styles.icon, isActive && styles.activeIcon]}>
              {tab.icon}
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  activeTab: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)', // Subtle primary brand tint on active tab, very premium
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    opacity: 0.5,
  },
  activeIcon: {
    opacity: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});

