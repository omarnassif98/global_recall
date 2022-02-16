with open('emoji_countries.txt', 'r+') as f:
    country_list = f.read().split('\n')
    for idx in range(len(country_list)):
        print(country_list[idx])
        flag, country = country_list[idx].split(' Flag: ')
        country_list[idx] = '{}|{}|{}'.format(flag, country, idx)
    f.seek(0)
    f.writelines(['{}\n'.format(country) for country in country_list])
    f.close()