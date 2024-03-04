def decode(message_file):
    # First, read the content from the file
    with open(message_file, 'r') as file:
        lines = file.readlines()

    # Process each line to map numbers to words
    num_to_word = {}
    for line in lines:
        if line != "" and line != "\n":
            parts = line.strip().split(' ')
            num = int(parts[0])
            word = parts[1]
            num_to_word[num] = word

    # Determine the pyramid structure to find which numbers/words to use
    row = 1
    selected_nums = []
    while len(num_to_word) >= row:
        start_num = sum(range(1, row)) + 1  # Calculate the starting number for the current row
        end_num = start_num + row - 1  # Calculate the ending number (inclusive) for the current row
        if end_num in num_to_word:  # We only care about the last number in each row
            selected_nums.append(end_num)
        row += 1

    # Construct the decoded message using the selected numbers
    decoded_message = ' '.join([num_to_word[num] for num in selected_nums])

    return decoded_message


print(decode('words.txt'))
