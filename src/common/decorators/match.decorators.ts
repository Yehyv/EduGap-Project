import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function Match(
  property: string, // اسم الحقل اللي هيتقارن معاه، زي password
  validationOptions?: ValidationOptions, // رسالة الخطأ المخصصة (اختياري)
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const relatedPropertyName = args.constraints?.[0] as string;
          const objectToValidate = args.object as Record<string, unknown>;
          const relatedValue = objectToValidate[relatedPropertyName];

          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must match ${args.constraints[0]}`;
        },
      },
    });
  };
}
