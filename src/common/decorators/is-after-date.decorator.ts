import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { parseISO, isAfter } from 'date-fns';

export function IsAfterDate(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isAfterDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as string[];
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];

          if (typeof value !== 'string' || typeof relatedValue !== 'string') {
            return false;
          }

          try {
            const dateToValidate = parseISO(value);
            const relatedDate = parseISO(relatedValue);
            return isAfter(dateToValidate, relatedDate);
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as string[];
          return `${args.property} must be after ${relatedPropertyName}`;
        },
      },
    });
  };
}
