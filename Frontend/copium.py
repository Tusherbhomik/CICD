import os

def write_files_recursive_to_file(directory_path, output_file_path):
    """
    Recursively finds all files within a given directory, and writes their
    relative path and content to a specified output file in a specific format.

    Args:
        directory_path: The path to the directory to scan.
        output_file_path: The path to the file where the output will be written.
    """
    if not os.path.isdir(directory_path):
        # Still print this error to console as it's a setup issue
        print(f"Error: '{directory_path}' is not a valid directory.")
        return

    # Get the absolute path to handle relative input paths correctly
    abs_directory_path = os.path.abspath(directory_path)
    separator = "=" * 45 + "\n" # Define separator with newline

    try:
        # Open the output file in write mode ('w') with UTF-8 encoding
        with open(output_file_path, 'w', encoding='utf-8') as outfile:
            for root, _, files in os.walk(abs_directory_path):
                for filename in files:
                    # Construct the full path to the file
                    file_path = os.path.join(root, filename)

                    # Calculate the relative path from the original input directory
                    relative_path = os.path.relpath(file_path, abs_directory_path)

                    # Write the header with the relative file path to the output file
                    outfile.write(separator)
                    outfile.write(relative_path + "\n")
                    outfile.write(separator)

                    # Try to read the file content and write it to the output file
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as infile:
                            content = infile.read()
                        outfile.write(content + "\n") # Add newline after content
                    except Exception as e:
                        outfile.write(f"Could not read file: {e}\n")

                    # Write the footer to the output file
                    outfile.write(separator)
                    outfile.write("\n") # Add a blank line for separation

        print(f"Successfully wrote content to '{output_file_path}'")

    except Exception as e:
        # Print file writing errors to console
        print(f"Error writing to output file '{output_file_path}': {e}")



# write_files_recursive_to_file('ecommerce-BE\src\main\java\com\ecommerce', 'output.txt')
# write_files_recursive_to_file('ecommerce-FE/src/app', 'output.txt')
write_files_recursive_to_file('src/main/java/com/medscribe', 'output.txt')
