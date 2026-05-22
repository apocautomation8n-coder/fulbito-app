import React from 'react';
import { StyleSheet, Text, View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../theme/designSystem';

type Step = {
  id: string;
  label: string;
  completed?: boolean;
  current?: boolean;
};

type ProgressStepperProps = ViewProps & {
  steps: Step[];
  style?: StyleProp<ViewStyle>;
};

export function ProgressStepper({ steps, style, ...props }: ProgressStepperProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.completed;
        const isCurrent = step.current;

        return (
          <View key={step.id} style={styles.stepContainer}>
            <View style={styles.stepContent}>
              <View style={[
                styles.circle,
                isCompleted && styles.completedCircle,
                isCurrent && styles.currentCircle,
              ]}>
                {isCompleted ? (
                  <Check size={14} color={colors.background} />
                ) : (
                  <Text style={[
                    styles.stepNumber,
                    isCurrent && styles.currentStepNumber,
                  ]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text style={[
                styles.label,
                isCurrent && styles.currentLabel,
                isCompleted && styles.completedLabel,
              ]}>
                {step.label}
              </Text>
            </View>
            {!isLast && (
              <View style={[
                styles.line,
                isCompleted && styles.completedLine,
              ]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepContent: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCircle: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  currentCircle: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  currentStepNumber: {
    color: colors.background,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  currentLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  completedLabel: {
    color: colors.primary,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  completedLine: {
    backgroundColor: colors.primary,
  },
});

